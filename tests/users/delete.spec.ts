import { AppDataSource } from "../../src/config/data-source";
import { DataSource } from "typeorm";
import request from "supertest";
import app from "../../src/app";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../src/constants";
import { User } from "../../src/entity/User";
import { JWKS_MOCK_URL } from "../utils";

describe("DELETE /users/:id", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;

    beforeAll(async () => {
        jwks = createJWKSMock(JWKS_MOCK_URL);
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();
    });
    afterEach(() => {
        jwks.stop();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe("Given all fields", () => {
        it("should return 200 status code", async () => {
            const adminToken = jwks.token({
                sub: "1",
                role: Roles.ADMIN,
            });
            const userData = {
                firstName: "Zahid",
                lastName: "Sarang",
                email: "zahid@mern.space",
                password: "password",
                role: Roles.CUSTOMER,
                tenantId: 1,
            };

            const userRepository = connection.getRepository(User);
            const users = await userRepository.save(userData);

            const id = users.id;

            const response = await request(app)
                .delete(`/users/${id}`)
                .set("Cookie", [`accessToken=${adminToken}`])
                .send();

            expect(response.statusCode).toBe(200);
        });

        it("should check user not persist in database", async () => {
            const adminToken = jwks.token({
                sub: "1",
                role: Roles.ADMIN,
            });
            const userData = {
                firstName: "Zahid",
                lastName: "Sarang",
                email: "zahid@mern.space",
                password: "password",
                role: Roles.CUSTOMER,
                tenantId: 1,
            };

            const userRepository = connection.getRepository(User);
            const users = await userRepository.save(userData);

            const id = users.id;

            const response = await request(app)
                .delete(`/users/${id}`)
                .set("Cookie", [`accessToken=${adminToken}`])
                .send();

            const deleteUser = await userRepository.find();
            expect(response.statusCode).toBe(200);
            expect(deleteUser).toHaveLength(0);
        });
    });
});
