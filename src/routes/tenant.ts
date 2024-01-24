import express, {
    NextFunction,
    Request,
    RequestHandler,
    Response,
} from "express";
import { AppDataSource } from "../config/data-source";
import logger from "../config/logger";
import { Roles } from "../constants";
import { TenantController } from "../controllers/TenantController";
import { Tenant } from "../entity/Tenant";
import authenticate from "../middleware/authenticate";
import { canAccess } from "../middleware/canAccess";
import { TenantService } from "../services/TenantService";
import { CreateTenantRequest } from "../types";
import listTenantsValidator from "../validators/list-tenants-validator";
import tenantValidator from "../validators/tenant-validator";

const router = express.Router();
const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, logger);

router.post(
    "/",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    tenantValidator,
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.create(req, res, next) as unknown as RequestHandler,
);

router.get(
    "/",
    listTenantsValidator,
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.getTenant(req, res, next) as unknown as RequestHandler,
);

router.get(
    "/:id",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.getOneTenant(
            req,
            res,
            next,
        ) as unknown as RequestHandler,
);

router.patch(
    "/:id",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    tenantValidator,
    (req: CreateTenantRequest, res: Response, next: NextFunction) =>
        tenantController.update(req, res, next) as unknown as RequestHandler,
);
router.delete(
    "/:id",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.destory(req, res, next) as unknown as RequestHandler,
);
export default router;
