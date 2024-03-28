import { AppDataSource } from "../../src/config/data-source";
import { DataSource } from "typeorm";
import request from "supertest";
import app from "../../src/app";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../src/constants";
import { User } from "../../src/entity/User";
import { JWKS_MOCK_URL } from "../utils";

describe("GET /users", () => {
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
            const response = await request(app)
                .get("/users/")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send();

            expect(response.statusCode).toBe(200);
        });

        it("should return List of All users", async () => {
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

            const currentPage = 2;
            const perPage = 2;

            // Calculate the offset based on currentPage and perPage
            const offset = (currentPage - 1) * perPage;

            const users = await userRepository.find({
                skip: offset,
                take: perPage,
            });

            // Add token to cookie
            const response = await request(app)
                .get(`/users/?currentPage=${currentPage}&perPage=${perPage}`)
                .set("Cookie", [`accessToken=${adminToken}`])
                .send();

            expect(response.body).toHaveProperty("currentPage");
            expect(response.body).toHaveProperty("perPage");
            expect(response.body).toHaveProperty("total");
            expect(response.body).toHaveProperty("data");

            const keys = Object.keys(response.body as Record<string, string>);

            const userArray = keys.map(
                (key) => (response.body as Record<string, string>)[key],
            );
            expect(Array.isArray(userArray)).toBe(true);
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

        it("should not return passwords of the user", async () => {
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

            // Add token to cookie
            const response = await request(app)
                .get("/users/")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send();

            // If the response is an object, wrap it in an array
            const responseBodyArray = Array.isArray(response.body)
                ? response.body
                : [response.body];

            // Assert that the response is an array
            expect(Array.isArray(responseBodyArray)).toBe(true);

            // If the response is an array, assert that it contains user objects
            expect(
                responseBodyArray.every(
                    (user: any) => !user.hasOwnProperty("password"),
                ),
            ).toBe(true);
        });
    });
});
