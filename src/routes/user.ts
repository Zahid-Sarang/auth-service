import express from "express";
import { AppDataSource } from "../config/data-source";
import { Roles } from "../constants";
import { UserController } from "../controllers/UserController";
import { User } from "../entity/User";
import authenticate from "../middleware/authenticate";
import { canAccess } from "../middleware/canAccess";
import { UserService } from "../services/UserService";

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.post("/", authenticate, canAccess([Roles.ADMIN]), (req, res, next) =>
    userController.create(req, res, next),
);

export default router;
