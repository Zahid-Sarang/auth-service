import { Response, NextFunction, Request } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Logger } from "winston";
import { TenantService } from "../services/TenantService";
import { CreateTenantRequest } from "../types";
export class TenantController {
    constructor(
        private tenantService: TenantService,
        private logger: Logger,
    ) {}
    async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
        // Validation
        const validationError = validationResult(req);
        if (!validationError.isEmpty()) {
            return res.status(400).json({ errors: validationError.array() });
        }
        const { name, address } = req.body;
        this.logger.debug("Request for creating a new tenant", req.body);
        try {
            const tenant = await this.tenantService.create({ name, address });
            this.logger.info("Tenant has been created", { id: tenant.id });
            res.status(201).json({ id: tenant.id });
        } catch (err) {
            next(err);
            return;
        }
    }

    async getTenant(req: Request, res: Response, next: NextFunction) {
        try {
            const tenants = await this.tenantService.getTenants();
            this.logger.info("All tenant have been fetched");
            res.json(tenants);
        } catch (err) {
            next(err);
        }
    }

    async getOneTenant(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.params.id;

        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, "Invalid tenant Id"));
            return;
        }
        try {
            const tenant = await this.tenantService.findById(Number(tenantId));
            if (!tenant) {
                next(createHttpError(400, "Tenant does not exist"));
            }
            this.logger.info("Tenanthas been fetched");
            res.json(tenant);
        } catch (error) {
            next(error);
        }
    }
}
