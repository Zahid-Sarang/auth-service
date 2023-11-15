import { Repository } from "typeorm";
import { Tenant } from "../entity/Tenant";
import { ITenant } from "../types";

export class TenantService {
    constructor(private tenantRepository: Repository<Tenant>) {}
    async create(tenantData: ITenant) {
        return await this.tenantRepository.save(tenantData);
    }

    async getTenants() {
        return await this.tenantRepository.find();
    }

    async findById(id: number) {
        return await this.tenantRepository.findOne({
            where: {
                id,
            },
        });
    }

    async update(id: number, tenantData: ITenant) {
        return await this.tenantRepository.update(id, tenantData);
    }
    async deleteById(tenantId: number) {
        return await this.tenantRepository.delete(tenantId);
    }
}
