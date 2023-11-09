import express, { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import logger from "../config/logger";
import { Roles } from "../constants";
import { UserController } from "../controllers/UserController";
import { User } from "../entity/User";
import authenticate from "../middleware/authenticate";
import { canAccess } from "../middleware/canAccess";
import { UserService } from "../services/UserService";
import { UpdateUserRequest } from "../types";
import createUserValidator from "../validators/create-user-validator";
import updateUserValidators from "../validators/update-user-validators";

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService, logger);

router.post(
    "/",
    createUserValidator,
    authenticate,
    canAccess([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        userController.create(req, res, next),
);

router.get(
    "/",
    authenticate,
    canAccess([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        userController.getUsers(req, res, next),
);

router.get(
    "/:id",
    authenticate,
    canAccess([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        userController.getOneUser(req, res, next),
);

router.patch(
    "/:id",
    updateUserValidators,
    authenticate,
    canAccess([Roles.ADMIN]),
    (req: UpdateUserRequest, res: Response, next: NextFunction) =>
        userController.updateUser(req, res, next),
);

export default router;
