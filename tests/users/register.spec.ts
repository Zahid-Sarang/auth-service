import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/data-source";
import { Roles } from "../../src/constants";
import { User } from "../../src/entity/User";

describe("POST /auth/register", () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        // DataBase truncate
        await connection.dropDatabase();
        await connection.synchronize();
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
        });

        it("should retrun an id of the created user", async () => {
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
            // expect(response.body).toEqual({ id: expect.any(Number) });
            expect(response.body).toHaveProperty("id");
        });

        it("should asign the a customer role", async () => {
            // Arrange
            const userData = {
                firstName: "John",
                lastName: "Smith",
                email: "zahid@gmail.com",
                password: "secret",
            };

            // Act
            await request(app).post("/auth/register").send(userData);

            //Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users[0]).toHaveProperty("role");
            expect(users[0].role).toBe(Roles.CUSTOMER);
        });

        it("should store the hased password in the database", async () => {
            // Arrange
            const userData = {
                firstName: "John",
                lastName: "Smith",
                email: "zahid@gmail.com",
                password: "secret",
            };

            // Act
            await request(app).post("/auth/register").send(userData);

            //Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users[0].password).not.toBe(userData.password);
            expect(users[0].password).toHaveLength(60);
            expect(users[0].password).toMatch(/^\$2b\$\d+\$/);
        });

        it("should return 400 status code if email is already exist", async () => {
            // Arrange
            const userData = {
                firstName: "John",
                lastName: "Smith",
                email: "zahid@gmail.com",
                password: "secret",
                role: Roles.CUSTOMER,
            };
            const userRepository = connection.getRepository(User);
            await userRepository.save({ ...userData });

            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            const users = await userRepository.find();

            //Assert
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(1);
        });
    });

    describe("Fields are missing", () => {
        it("should return 400 status code if email field is missing", async () => {
            // Arrange
            const userData = {
                firstName: "John",
                lastName: "Smith",
                email: "",
                password: "secret",
            };

            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            const userRepository = connection.getRepository(User);
            const user = await userRepository.find();
            expect(response.statusCode).toBe(400);
            expect(user).toHaveLength(0);
        });
    });

    describe("Fields are not in proper format", () => {
        it("should trim the email field", async () => {
            // Arrange
            const userData = {
                firstName: "John",
                lastName: "Smith",
                email: " zahid@example.com ",
                password: "secret",
            };

            // Act
            await request(app).post("/auth/register").send(userData);

            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            const user = users[0];
            expect(user.email).toBe("zahid@example.com");
        });
    });
});
