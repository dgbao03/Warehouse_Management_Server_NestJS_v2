import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateWarehouseTransferDTO, UpdateWarehouseTransferDTO } from './dtos';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { Auth } from '../../decorators/permission.decorator';
import { CurrentTenant } from 'src/decorators/current-tenant.decorator';
import { WarehouseTransfer } from './entities/warehouse-transfer.entity';
import { WarehouseTransferService } from './services/warehouse-transfer.service';

@Controller('warehouse-transfer')
export class WarehouseTransferController {
    constructor(
        private warehouseTransferService: WarehouseTransferService,
    ) {}

    @Get()
    @Auth("get_all_warehouse_transfers")
    getAllWarehouseTransfers(
        @Query('search') query: string, 
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 5,
        @CurrentTenant() tenantId: string
    ): Promise<Pagination<WarehouseTransfer>>{
        limit = limit > 5 ? 5 : limit;
        const options: IPaginationOptions = {
            page,
            limit,
            route: '/warehouses/transfers', 
        };

        return this.warehouseTransferService.getAllWarehouseTransfers(options, tenantId, query);
    }

    @Get(':id')
    @Auth("get_warehouse_transfer_by_id")
    async getWarehouseTransferById(@Param('id') id: string) {
        return this.warehouseTransferService.getWarehouseTransferById(id);
    }

    @Post()
    @Auth("create_warehouse_transfer")
    @UsePipes(new ValidationPipe())
    async createWarehouseTransfer(@Body() createData: CreateWarehouseTransferDTO, @CurrentTenant() tenantId: string) {
        return this.warehouseTransferService.createWarehouseTransfer(createData, tenantId);
    }

    @Put('transfers/:id')
    @Auth("update_warehouse_transfer")
    @UsePipes(new ValidationPipe())
    async updateWarehouseTransfer(@Param('id') id: string, @Body() updateData: UpdateWarehouseTransferDTO, @CurrentTenant() tenantId: string) {
        return this.warehouseTransferService.updateWarehouseTransfer(id, updateData, tenantId);
    }

    @Delete('transfers/:id')
    @Auth("delete_warehouse_transfer")
    async deleteWarehouseTransfer(@Param('id') id: string) {
        return this.warehouseTransferService.deleteWarehouseTransfer(id);
    }
}
