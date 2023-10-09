import { Response, NextFunction } from "express";
import { Logger } from "winston";
import { UserService } from "../service/UserService";
import { RegisterUserRequest } from "../types";
import { validationResult } from "express-validator";

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
    ) {
        this.userService = userService;
    }
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
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: "******",
        });
        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
            });
            this.logger.info("User has been registered", { id: user.id });
            res.status(201).json({ id: user.id });
        } catch (err) {
            next(err);
            return;
        }
    }
}
