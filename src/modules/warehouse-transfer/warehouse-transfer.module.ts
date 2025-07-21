import { Module } from '@nestjs/common';
import { WarehouseTransferController } from './warehouse-transfer.controller';
import { WarehouseTransferService } from './services/warehouse-transfer.service';
import WarehouseTransferRepository from './repositories/warehouse-transfer.repository';
import WarehouseTransferDetailRepository from './repositories/warehouse-transfer-detail.repository';
import { PermissionModule } from '../permission/permission.module';
import { JwtModule } from '../jwt/jwt.module';

@Module({
  controllers: [WarehouseTransferController],
  providers: [WarehouseTransferService, WarehouseTransferRepository, WarehouseTransferDetailRepository],
  exports: [WarehouseTransferService, WarehouseTransferRepository, WarehouseTransferDetailRepository],
  imports: [JwtModule, PermissionModule]
})
export class WarehouseTransferModule {}
