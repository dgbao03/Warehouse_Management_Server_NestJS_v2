import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import WarehouseTransferRepository from '../repositories/warehouse-transfer.repository';
import WarehouseTransferDetailRepository from '../repositories/warehouse-transfer-detail.repository';
import { DataSource } from 'typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { WarehouseTransfer } from '../entities/warehouse-transfer.entity';
import { CreateWarehouseTransferDTO, UpdateWarehouseTransferDTO } from '../dtos';
import { WarehouseTransferDetail } from '../entities/warehouse-transfer-detail.entity';
import { WarehouseDetail } from 'src/modules/warehouse/entities/warehouse-detail.entity';

@Injectable()
export class WarehouseTransferService {
    constructor(
        private readonly warehouseTransferRepository: WarehouseTransferRepository,
        private readonly warehouseTransferDetailRepository: WarehouseTransferDetailRepository,
        private readonly dataSource: DataSource
    ) {}

    async getAllWarehouseTransfers(options: IPaginationOptions, tenantId: string, query?: string) {
        const queryBuilder = this.warehouseTransferRepository.createQueryBuilder('warehouseTransfer');

        queryBuilder.where('warehouseTransfer.tenant.id = :tenantId', { tenantId });

        if (query) queryBuilder.andWhere('LOWER(warehouseTransfer.description) LIKE :query', { query: `%${query.toLowerCase()}%` });

        queryBuilder.orderBy('warehouseTransfer.updatedAt', 'DESC');

        return paginate<WarehouseTransfer>(queryBuilder, options);
    }

    async getWarehouseTransferById(id: string) {
        return this.warehouseTransferRepository.findOne({ where: { id }, relations: ['warehouseTransferDetails', 'fromWarehouse', 'toWarehouse', 'warehouseTransferDetails.product'] });
    }

    async createWarehouseTransfer(createData: CreateWarehouseTransferDTO, tenantId: string) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const warehouseTransferRepository = queryRunner.manager.getRepository(WarehouseTransfer);
            const warehouseTransferDetailRepository = queryRunner.manager.getRepository(WarehouseTransferDetail);
            const warehouseDetailRepository = queryRunner.manager.getRepository(WarehouseDetail);

            const newWarehouseTransfer = warehouseTransferRepository.create({
                user: { id: createData.userId},
                description: createData.description,
                fromWarehouse: { id: createData.fromWarehouseId },
                toWarehouse: { id: createData.toWarehouseId },
                tenant: { id: tenantId }
            });

            const savedWarehouseTransfer = await warehouseTransferRepository.save(newWarehouseTransfer);

            for (const warehouseTransferDetail of createData.warehouseTransferDetails){
                const outgoingWarehouseDetail = await warehouseDetailRepository.findOne({ where: { warehouse: { id: createData.fromWarehouseId }, product: { id: warehouseTransferDetail.productId } }, relations: ['product'] });
                if (!outgoingWarehouseDetail) throw new NotFoundException(`Product not found in outgoing warehouse! Cannot create warehouse transfer!`);
                
                if (warehouseTransferDetail.quantity > outgoingWarehouseDetail.quantity) throw new BadRequestException(`Transfer quantity for product ${outgoingWarehouseDetail.product.name} (${warehouseTransferDetail.quantity}) exceeds current quantity in outgoing warehouse (${outgoingWarehouseDetail.quantity})`);

                outgoingWarehouseDetail.quantity -= warehouseTransferDetail.quantity;
                await warehouseDetailRepository.save(outgoingWarehouseDetail);

                const incomingWarehouseDetail = await warehouseDetailRepository.findOneBy({ warehouse: { id: createData.toWarehouseId }, product: { id: warehouseTransferDetail.productId } });
                if (incomingWarehouseDetail){
                    incomingWarehouseDetail.quantity += warehouseTransferDetail.quantity;
                    await warehouseDetailRepository.save(incomingWarehouseDetail);
                } else {
                    const newIncomingWarehouseDetail = warehouseDetailRepository.create({
                        warehouse: { id: createData.toWarehouseId },
                        product: { id: warehouseTransferDetail.productId },
                        quantity: warehouseTransferDetail.quantity,
                        tenant: { id: tenantId }
                    });
                    await warehouseDetailRepository.save(newIncomingWarehouseDetail);
                }

                const newWarehouseTransferDetail = warehouseTransferDetailRepository.create({
                    warehouseTransfer: savedWarehouseTransfer,
                    product: { id: warehouseTransferDetail.productId },
                    quantity: warehouseTransferDetail.quantity,
                    tenant: { id: tenantId }
                });

                await warehouseTransferDetailRepository.save(newWarehouseTransferDetail);
            }
            
            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async updateWarehouseTransfer(id: string, updateData: UpdateWarehouseTransferDTO, tenantId: string) {
        const warehouseTransfer = await this.warehouseTransferRepository.findOne({ where: { id }, relations: ['warehouseTransferDetails', 'fromWarehouse', 'toWarehouse', 'warehouseTransferDetails.product'] });
        if (!warehouseTransfer) throw new NotFoundException('Warehouse transfer not found! Please try again!');

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const warehouseTransferRepository = queryRunner.manager.getRepository(WarehouseTransfer);
            const warehouseTransferDetailRepository = queryRunner.manager.getRepository(WarehouseTransferDetail);
            const warehouseDetailRepository = queryRunner.manager.getRepository(WarehouseDetail);

            for (const warehouseTransferDetail of warehouseTransfer.warehouseTransferDetails){
                const outgoingWarehouseDetail = await warehouseDetailRepository.findOne({ where: { warehouse: { id: warehouseTransfer.fromWarehouse.id }, product: { id: warehouseTransferDetail.product.id } } });

                outgoingWarehouseDetail!.quantity += warehouseTransferDetail.quantity;
                await warehouseDetailRepository.save(outgoingWarehouseDetail!);
                
                const incomingWarehouseDetail = await warehouseDetailRepository.findOneBy({ warehouse: { id: warehouseTransfer.toWarehouse.id }, product: { id: warehouseTransferDetail.product.id } });

                incomingWarehouseDetail!.quantity -= warehouseTransferDetail.quantity;
                await warehouseDetailRepository.save(incomingWarehouseDetail!);

                await warehouseTransferDetailRepository.delete(warehouseTransferDetail);
            }

            for (const warehouseTransferDetail of updateData.warehouseTransferDetails){
                const outgoingWarehouseDetail = await warehouseDetailRepository.findOne({ where: { warehouse: { id: updateData.fromWarehouseId }, product: { id: warehouseTransferDetail.productId } }, relations: ['product'] });
                if (!outgoingWarehouseDetail) throw new NotFoundException('Product not found in outgoing warehouse! Cannot create warehouse transfer!');
                
                if (warehouseTransferDetail.quantity > outgoingWarehouseDetail.quantity) throw new BadRequestException(`Transfer quantity for product ${outgoingWarehouseDetail.product.name} (${warehouseTransferDetail.quantity}) exceeds current quantity in outgoing warehouse (${outgoingWarehouseDetail.quantity})`);

                outgoingWarehouseDetail.quantity -= warehouseTransferDetail.quantity;
                await warehouseDetailRepository.save(outgoingWarehouseDetail);

                const incomingWarehouseDetail = await warehouseDetailRepository.findOneBy({ warehouse: { id: updateData.toWarehouseId }, product: { id: warehouseTransferDetail.productId } });
                if (incomingWarehouseDetail){
                    incomingWarehouseDetail.quantity += warehouseTransferDetail.quantity;
                    await warehouseDetailRepository.save(incomingWarehouseDetail);
                } else {
                    const newIncomingWarehouseDetail = warehouseDetailRepository.create({
                        warehouse: { id: updateData.toWarehouseId },
                        product: { id: warehouseTransferDetail.productId },
                        quantity: warehouseTransferDetail.quantity,
                        tenant: { id: tenantId }
                    });
                    await warehouseDetailRepository.save(newIncomingWarehouseDetail);
                }

                const newWarehouseTransferDetail = warehouseTransferDetailRepository.create({
                    warehouseTransfer: warehouseTransfer,
                    product: { id: warehouseTransferDetail.productId },
                    quantity: warehouseTransferDetail.quantity,
                    tenant: { id: tenantId }
                });

                await warehouseTransferDetailRepository.save(newWarehouseTransferDetail);
            }   

            await warehouseTransferRepository.update(id, { 
                user: { id: updateData.userId },
                description: updateData.description, 
                fromWarehouse: { id: updateData.fromWarehouseId }, 
                toWarehouse: { id: updateData.toWarehouseId } 
            });

            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async deleteWarehouseTransfer(id: string) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const warehouseTransferRepository = queryRunner.manager.getRepository(WarehouseTransfer);
            const warehouseTransferDetailRepository = queryRunner.manager.getRepository(WarehouseTransferDetail);
            const warehouseDetailRepository = queryRunner.manager.getRepository(WarehouseDetail);

            const warehouseTransfer = await warehouseTransferRepository.findOne({ where: { id }, relations: ['warehouseTransferDetails', 'fromWarehouse', 'toWarehouse', 'warehouseTransferDetails.product'] });
            if (!warehouseTransfer) throw new NotFoundException('Warehouse transfer not found! Please try again!');

            for (const warehouseTransferDetail of warehouseTransfer.warehouseTransferDetails){
                const outgoingWarehouseDetail = await warehouseDetailRepository.findOne({ where: { warehouse: { id: warehouseTransfer.fromWarehouse.id }, product: { id: warehouseTransferDetail.product.id } } });

                outgoingWarehouseDetail!.quantity += warehouseTransferDetail.quantity;
                await warehouseDetailRepository.save(outgoingWarehouseDetail!);

                const incomingWarehouseDetail = await warehouseDetailRepository.findOneBy({ warehouse: { id: warehouseTransfer.toWarehouse.id }, product: { id: warehouseTransferDetail.product.id } });

                incomingWarehouseDetail!.quantity -= warehouseTransferDetail.quantity;
                await warehouseDetailRepository.save(incomingWarehouseDetail!);

                await warehouseTransferDetailRepository.delete(warehouseTransferDetail);
            }

            await warehouseTransferRepository.delete(id);

            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}
