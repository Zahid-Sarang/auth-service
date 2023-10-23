import { Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Logger } from "winston";
import { UserService } from "../services/UserService";
import { TokenService } from "../services/TokenService";
import { AuthRequest, RegisterUserRequest } from "../types";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { CredentialService } from "../services/CredentialService";

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
        private credentialsService: CredentialService,
    ) {}
    // Register Method
    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        // Validation
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
        const { firstName, lastName, email, password } = req.body;
        this.logger.debug("New request to register a user:", {
            firstName,
            lastName,
            email,
            password: "******",
        });

        // persist user information
        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
            });
            this.logger.info("User has been registered", { id: user.id });

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            // generate accesstoken
            const accessToken = this.tokenService.generateAccessToken(payload);

            // Persist the refresh token
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            // generate refresh token
            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });

            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60,
                httpOnly: true,
            });

            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365,
                httpOnly: true,
            });

            res.status(201).json({ id: user.id });
        } catch (err) {
            next(err);
            return;
        }
    }

    // Login Method
    async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
        // Validation
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        const { email, password } = req.body;
        this.logger.debug("New request to register a user:", {
            email,
            password: "******",
        });

        // check if email is existing in database
        try {
            const user = await this.userService.findByEmail(email);
            if (!user) {
                const error = createHttpError(
                    400,
                    "Email and password dosn't match!",
                );
                next(error);
                return;
            }

            // compare password
            const passwordMatch = await this.credentialsService.comparePassword(
                password,
                user.password,
            );
            if (!passwordMatch) {
                const error = createHttpError(
                    400,
                    "Email and password dosn't match!",
                );
                next(error);
                return;
            }
            // generate token
            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });

            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60,
                httpOnly: true,
            });

            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365,
                httpOnly: true,
            });

            this.logger.info("User hasb been logged in successfully", {
                id: user.id,
            });

            res.status(200).json({ id: user.id });
        } catch (err) {
            next(err);
            return;
        }
    }

    async self(req: AuthRequest, res: Response) {
        const userInfo = await this.userService.findById(Number(req.auth.sub));
        res.json({ ...userInfo, password: undefined });
    }
}
