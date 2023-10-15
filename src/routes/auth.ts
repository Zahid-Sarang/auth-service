import express, { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { AuthController } from "../controllers/AuthController";
import { UserService } from "../service/UserService";
import { User } from "../entity/User";
import logger from "../config/logger";
import registerValidators from "../validators/register-validators";
import { TokenService } from "../service/TokenService";

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const tokenService = new TokenService();
const authController = new AuthController(userService, logger, tokenService);

router.post(
    "/register",
    registerValidators,
    (req: Request, res: Response, next: NextFunction) =>
        authController.register(req, res, next),
);

export default router;
