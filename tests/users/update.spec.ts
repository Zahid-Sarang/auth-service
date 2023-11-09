import { AppDataSource } from "../../src/config/data-source";
import { DataSource } from "typeorm";
import request from "supertest";
import app from "../../src/app";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../src/constants";
import { User } from "../../src/entity/User";

describe("PATCH /users/:id", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;

    beforeAll(async () => {
        jwks = createJWKSMock("http://localhost:8000");
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

            const updateData = {
                firstName: "Sarang",
                lastName: "Zahid",
                role: Roles.MANAGER,
            };
            const id = users.id;

            const response = await request(app)
                .patch(`/users/${id}`)
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(updateData);

            expect(response.statusCode).toBe(200);
        });

        it("should return updated user data", async () => {
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

            const updateData = {
                firstName: "Sarang",
                lastName: "Zahid",
                role: Roles.MANAGER,
            };
            const id = users.id;

            const response = await request(app)
                .patch(`/users/${id}`)
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(updateData);

            const findUser = await userRepository.findOne({
                where: {
                    id: Number((response.body as Record<string, string>).id),
                },
            });

            expect(response.statusCode).toBe(200);
            expect(findUser?.id).toBe(id);
            expect(findUser?.firstName).not.toBe(userData.firstName);
            expect(findUser?.lastName).not.toBe(userData.lastName);
        });
    });
});
