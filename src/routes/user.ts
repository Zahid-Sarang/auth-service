import express, {
    NextFunction,
    Request,
    RequestHandler,
    Response,
} from "express";
import { AppDataSource } from "../config/data-source";
import logger from "../config/logger";
import { Roles } from "../constants";
import { UserController } from "../controllers/UserController";
import { RefreshToken } from "../entity/RefreshToken";
import { User } from "../entity/User";
import authenticate from "../middleware/authenticate";
import { canAccess } from "../middleware/canAccess";
import { TokenService } from "../services/TokenService";
import { UserService } from "../services/UserService";
import { CreateUserRequest, UpdateUserRequest } from "../types";
import createUserValidator from "../validators/create-user-validator";
import updateUserValidators from "../validators/update-user-validators";

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const tokenService = new TokenService(refreshTokenRepository);
const userController = new UserController(userService, logger, tokenService);

router.post(
    "/",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    createUserValidator,
    (req: CreateUserRequest, res: Response, next: NextFunction) =>
        userController.create(req, res, next) as unknown as RequestHandler,
);

router.get(
    "/",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        userController.getUsers(req, res, next) as unknown as RequestHandler,
);

router.get(
    "/:id",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        userController.getOneUser(req, res, next) as unknown as RequestHandler,
);

router.patch(
    "/:id",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    updateUserValidators,
    (req: UpdateUserRequest, res: Response, next: NextFunction) =>
        userController.updateUser(req, res, next) as unknown as RequestHandler,
);

router.delete(
    "/:id",
    updateUserValidators,
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    (req: UpdateUserRequest, res: Response, next: NextFunction) =>
        userController.deleteUser(req, res, next) as unknown as RequestHandler,
);

export default router;
