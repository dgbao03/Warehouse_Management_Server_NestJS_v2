import BaseEntity from "../../../databases/base.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { WarehouseDetail } from "./warehouse-detail.entity";
import { ExportDetail } from "../../../modules/export-record/entities/export-detail.entity";
import { ImportDetail } from "../../../modules/import-record/entities/import-detail.entity";
import { Tenant } from "../../tenant/entities/tenant.entity";
import { WarehouseTransfer } from "../../warehouse-transfer/entities/warehouse-transfer.entity";

@Entity({ name: "warehouses" })
export class Warehouse extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "varchar", length: 255 })
    name: string;

    @Column({ type: "varchar", length: 255 })
    address: string;

    @Column({ type: "text", nullable: true })
    phone: string;

    @OneToMany(() =>  WarehouseDetail, (warehouseDetail) => warehouseDetail.warehouse)
    warehouseDetails: WarehouseDetail[];

    @OneToMany(() => ExportDetail, (exportDetail) => exportDetail.warehouse)
    exportDetails: ExportDetail[];

    @OneToMany(() => ImportDetail, (importDetail) => importDetail.warehouse)
    importDetails: ImportDetail[];

    @OneToMany(() => WarehouseTransfer, (warehouseTransfer) => warehouseTransfer.fromWarehouse)
    fromWarehouseTransfers: WarehouseTransfer[];

    @OneToMany(() => WarehouseTransfer, (warehouseTransfer) => warehouseTransfer.toWarehouse)
    toWarehouseTransfers: WarehouseTransfer[];

    @ManyToOne(() => Tenant, (tenant) => tenant.warehouses)
    @JoinColumn({ name: "tenant_id" })
    tenant: Tenant;
}