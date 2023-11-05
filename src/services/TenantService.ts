import { Repository } from "typeorm";
import { Tenant } from "../entity/Tenant";
import { ITenant } from "../types";

export class TenantService {
    constructor(private tenantRepository: Repository<Tenant>) {}
    async create(tenantData: ITenant) {
        return await this.tenantRepository.save(tenantData);
    }
}
