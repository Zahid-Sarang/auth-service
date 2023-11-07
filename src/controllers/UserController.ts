import { NextFunction, Request, Response } from "express";
import { Roles } from "../constants";
import { UserService } from "../services/UserService";
import { CreateUserRequest } from "../types";
import { validationResult } from "express-validator";

export class UserController {
    constructor(private userService: UserService) {}

    async create(req: CreateUserRequest, res: Response, next: NextFunction) {
        // Validation
        const validationError = validationResult(req);
        if (!validationError.isEmpty()) {
            return res.status(400).json({ error: validationError.array() });
        }
        const { firstName, lastName, email, password } = req.body;
        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                role: Roles.MANAGER,
            });
            res.status(201).json({ id: user.id });
        } catch (err) {
            next(err);
        }
    }

    async getUsers(req: Request, res: Response, next: NextFunction) {
        try {
            res.status(200).json({});
        } catch (err) {
            next(err);
        }
    }
}