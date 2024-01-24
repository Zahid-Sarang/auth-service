import { Repository } from "typeorm";
import { Tenant } from "../entity/Tenant";
import { ITenant, TenantQueryParams } from "../types";

export class TenantService {
    constructor(private tenantRepository: Repository<Tenant>) {}
    async create(tenantData: ITenant) {
        return await this.tenantRepository.save(tenantData);
    }

    async getTenants(validatedQuery: TenantQueryParams) {
        const queryBuilder = this.tenantRepository.createQueryBuilder("tenant");
        const result = await queryBuilder
            .skip((validatedQuery.currentPage - 1) * validatedQuery.perPage)
            .take(validatedQuery.perPage)
            .orderBy("tenant.id", "DESC")
            .getManyAndCount();
        return result;
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
