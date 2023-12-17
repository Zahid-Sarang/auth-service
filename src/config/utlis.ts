import { Config } from ".";
import { User } from "../entity/User";
import { AppDataSource } from "./data-source";
import logger from "./logger";
import bcrypt from "bcryptjs";
import { Roles } from "../constants";

const CreateAdminUser = async () => {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const isAdminExist = await userRepository.findOne({
            where: { email: Config.ADMIN_EMAIL },
        });
        if (isAdminExist) {
            logger.info("Admin user already exists");
            return false;
        }
        const saltRound = 10;
        const hashedPassword = await bcrypt.hash(
            Config.ADMIN_PASSWORD!,
            saltRound,
        );
        await userRepository.save({
            firstName: "Zahid",
            lastName: "Sarang",
            email: Config.ADMIN_EMAIL,
            password: hashedPassword,
            role: Roles.ADMIN,
        });
        logger.info("Admin user created");
        return true;
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.message);
            setTimeout(() => {
                process.exit(1);
            });
        }
    }
};

export default CreateAdminUser;
