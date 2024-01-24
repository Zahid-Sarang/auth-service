import { Response, NextFunction, Request } from "express";
import { matchedData, validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Logger } from "winston";
import { TenantService } from "../services/TenantService";
import { CreateTenantRequest, TenantQueryParams } from "../types";
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
        const validatedQuery = matchedData(req, { onlyValidData: true });
        try {
            const [tenants, count] = await this.tenantService.getTenants(
                validatedQuery as TenantQueryParams,
            );
            this.logger.info("All tenant have been fetched");
            res.json({
                currentPage: validatedQuery.currentPage as number,
                perPage: validatedQuery.perPage as number,
                total: count,
                data: tenants,
            });
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

    async update(req: CreateTenantRequest, res: Response, next: NextFunction) {
        // validation
        const validationError = validationResult(req);
        if (!validationError.isEmpty()) {
            return res.status(400).json({ error: validationError.array() });
        }

        const { name, address } = req.body;
        const tenantId = req.params.id;

        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, "Invalid url param."));
            return;
        }
        this.logger.debug("Request for updating a tenant", req.body);
        try {
            await this.tenantService.update(Number(tenantId), {
                name,
                address,
            });
            this.logger.info("Tenant has been updated", { id: tenantId });

            res.json({ id: Number(tenantId) });
        } catch (error) {
            next(error);
        }
    }

    async destory(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.params.id;

        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, "Invalid url param."));
            return;
        }
        try {
            await this.tenantService.deleteById(Number(tenantId));

            this.logger.info("Tenant has been deleted", {
                id: Number(tenantId),
            });
            res.json({ id: Number(tenantId) });
        } catch (err) {
            next(err);
        }
    }
}
