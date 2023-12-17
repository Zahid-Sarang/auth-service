import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import CreateAdmin from "../../src/config/utlis";
import { Roles } from "../../src/constants";
import { User } from "../../src/entity/User";
import bcrypt from "bcryptjs";

describe("CreateAdmin", () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    it("should return false if admin exist", async () => {
        const userData = {
            firstName: "Zahid",
            lastName: "sarang",
            email: "Zahid@mern.space",
            password: "password",
        };

        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const userRepository = connection.getRepository(User);
        await userRepository.save({
            ...userData,
            password: hashedPassword,
            role: Roles.ADMIN,
        });

        const result = await CreateAdmin();
        expect(result).toBe(false);
    });
});
