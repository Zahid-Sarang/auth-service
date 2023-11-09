import express, { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import logger from "../config/logger";
import { Roles } from "../constants";
import { UserController } from "../controllers/UserController";
import { User } from "../entity/User";
import authenticate from "../middleware/authenticate";
import { canAccess } from "../middleware/canAccess";
import { UserService } from "../services/UserService";
import registerValidators from "../validators/register-validators";

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService, logger);

router.post(
    "/",
    registerValidators,
    authenticate,
    canAccess([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        userController.create(req, res, next),
);

router.get(
    "/",
    authenticate,
    // canAccess([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        userController.getUsers(req, res, next),
);

export default router;
