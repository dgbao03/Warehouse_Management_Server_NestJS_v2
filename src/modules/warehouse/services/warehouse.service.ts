import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import WarehouseRepository from '../repositories/warehouse.repository';
import { IPaginationOptions, Pagination, paginate } from 'nestjs-typeorm-paginate';
import { Warehouse } from '../entities/warehouse.entity';
import { CreateWarehouseDTO, UpdateWarehouseDTO } from '../dtos';
import { DataSource } from 'typeorm';
import { WarehouseDetail } from '../entities/warehouse-detail.entity';

@Injectable()
export class WarehouseService {
    constructor(
        private warehouseRepository: WarehouseRepository,
        private dataSource: DataSource,
    ) {}


    async getAllWarehouses(options: IPaginationOptions, tenantId: string, query?: string): Promise<Pagination<Warehouse>> {
        const queryBuilder = this.warehouseRepository.createQueryBuilder('warehouse');

        queryBuilder.where('warehouse.tenant.id = :tenantId', { tenantId });

        if (query) queryBuilder.andWhere('LOWER(warehouse.name) LIKE :query', { query: `%${query.toLowerCase()}%` });

        return paginate<Warehouse>(queryBuilder, options);
    }

    async getAllWarehouseList(tenantId: string){
        return await this.warehouseRepository.find({ where: { tenant: { id: tenantId } } });
    }

    async getWarehouseById(id: string) {
        return this.warehouseRepository.findOne({ where: { id }, relations: ['warehouseDetails', 'warehouseDetails.product'] });
    }

    async createWarehouse(createData: CreateWarehouseDTO, tenantId: string) {
        const newWarehouse = this.warehouseRepository.create({ ...createData, tenant: { id: tenantId } });
        return this.warehouseRepository.save(newWarehouse);
    }

    async updateWarehouse(id: string, updateData: UpdateWarehouseDTO, tenantId: string) {
        const warehouse = await this.warehouseRepository.findOne({ where: { id, tenant: { id: tenantId } } });
        if (!warehouse) throw new NotFoundException('Warehouse not found! Please try again!');

        return await this.warehouseRepository.update(id, updateData);
    }

    async deleteWarehouse(id: string) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const warehouseRepository = queryRunner.manager.getRepository(Warehouse);
            const warehouseDetailRepository = queryRunner.manager.getRepository(WarehouseDetail);

            const warehouse = await warehouseRepository.findOne({ where: { id }, relations: ['warehouseDetails'] });
            if (!warehouse) throw new NotFoundException('Warehouse not found');

            if (warehouse.warehouseDetails.length > 0) throw new BadRequestException('This Warehouse has already been used! Cannot delete warehouse!');

            await warehouseDetailRepository.delete({ warehouseId: id });
            await warehouseRepository.softDelete(id);

            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}
