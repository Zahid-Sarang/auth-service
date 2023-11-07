import { AppDataSource } from "../../src/config/data-source";
import { DataSource } from "typeorm";
import request from "supertest";
import app from "../../src/app";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../src/constants";
import { User } from "../../src/entity/User";

describe("GET /users/allUsers", () => {
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
            const response = await request(app)
                .get("/users/allUsers")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send();

            expect(response.statusCode).toBe(200);
        });

        it("should return List of All userse", async () => {
            const userData = {
                firstName: "zahid",
                lastName: "sarang",
                email: "zahid@gmail.com",
                password: "password",
                tenantId: 1,
            };

            const adminToken = jwks.token({
                sub: "1",
                role: Roles.ADMIN,
            });

            const userRepository = connection.getRepository(User);
            await userRepository.save({
                ...userData,
                role: Roles.ADMIN,
            });

            const users = await userRepository.find();

            // Add token to cookie
            const response = await request(app)
                .get("/users/allUsers")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send();

            const keys = Object.keys(response.body as Record<string, string>);

            const userArray = keys.map(
                (key) => (response.body as Record<string, string>)[key],
            );
            expect(Array.isArray(userArray)).toBe(true);
            expect(userArray.length).toBe(users.length);
            for (let i = 0; i < users.length; i++) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                const userInResponse = response.body[i] as Record<
                    string,
                    string
                >;
                const userInDatabase = users[i];
                expect(userInResponse.email).toBe(userInDatabase.email);
            }
        });
    });
});
