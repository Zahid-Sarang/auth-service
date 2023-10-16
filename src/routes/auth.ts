import express, { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { AuthController } from "../controllers/AuthController";
import { UserService } from "../service/UserService";
import { User } from "../entity/User";
import logger from "../config/logger";
import registerValidators from "../validators/register-validators";
import { TokenService } from "../service/TokenService";
import { RefreshToken } from "../entity/RefreshToken";
import loginValidators from "../validators/login-validators";
import { CredentialService } from "../service/CredentialService";

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const tokenService = new TokenService(refreshTokenRepository);
const credentialsService = new CredentialService();
const authController = new AuthController(
    userService,
    logger,
    tokenService,
    credentialsService,
);

router.post(
    "/register",
    registerValidators,
    (req: Request, res: Response, next: NextFunction) =>
        authController.register(req, res, next),
);

router.post(
    "/login",
    loginValidators,
    (req: Request, res: Response, next: NextFunction) =>
        authController.login(req, res, next),
);

export default router;
