import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import { truncateTable } from "../utils";

describe("POST /auth/register", () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        // DataBase truncate
        await truncateTable(connection);
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe("Given all fields", () => {
        it("should return the 201 status code", async () => {
            // Arrange
            const userData = {
                firstName: "John",
                lastName: "Smith",
                email: "zahid@gmail.com",
                password: "secret",
            };

            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            expect(response.statusCode).toBe(201);
        });

        it("should return valid json format", async () => {
            // Arrange
            const userData = {
                firstName: "John",
                lastName: "Smith",
                email: "zahid@gmail.com",
                password: "secret",
            };

            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            expect(
                (response.headers as Record<string, string>)["content-type"],
            ).toEqual(expect.stringContaining("json"));
        });

        it("should persist the user in the database", async () => {
            // Arrange
            const userData = {
                firstName: "John",
                lastName: "Smith",
                email: "zahid@gmail.com",
                password: "secret",
            };

            // Act
            await request(app).post("/auth/register").send(userData);

            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(1);
            expect(users[0].firstName).toBe("John");
            expect(users[0].lastName).toBe("Smith");
            expect(users[0].email).toBe("zahid@gmail.com");
            expect(users[0].password).toBe("secret");
        });
        it("should retrun an id of the user", async () => {
            // Arrange
            const userData = {
                firstName: "John",
                lastName: "Smith",
                email: "zahid@gmail.com",
                password: "secret",
            };

            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            // Assert
            expect(response.statusCode).toBe(201);
            // expect(response.body).toEqual({ id: expect.any(Number) });
            expect(response.body).toHaveProperty("id");
        });
    });
    describe("Fields are missing", () => {});
});
