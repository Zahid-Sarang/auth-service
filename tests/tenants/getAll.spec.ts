import { DataSource } from "typeorm";

import request from "supertest";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { Tenant } from "../../src/entity/Tenant";

describe("GET /tenants", () => {
    let connection: DataSource;

    let accessToken: string;

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

    describe("Given all fields", () => {
        it("should return a 200 status code", async () => {
            const tenantData = {
                name: "Tenant Name",
                address: "Tenant Address",
            };

            const tenantRepository = connection.getRepository(Tenant);
            await tenantRepository.save(tenantData);
            const response = await request(app)
                .get("/tenants")
                .send(tenantData);

            expect(response.statusCode).toBe(200);
        });
        it("should return a List of all tenant", async () => {
            const tenantData = [
                {
                    name: "Tenant Name",
                    address: "Tenant Address",
                },
                {
                    name: "jhon",
                    address: "new York",
                },
            ];

            const currentPage = 1;
            const perPage = 6;

            const tenantRepository = connection.getRepository(Tenant);
            const tenant = await tenantRepository.save(tenantData);
            const response = await request(app)
                .get(`/tenants?currentPage=${currentPage}&perPage=${perPage}`)
                .set("Cookie", [`accessToken=${accessToken}`])
                .send(tenantData);
            expect(response.body).toHaveProperty("currentPage");
            expect(response.body).toHaveProperty("perPage");
            expect(response.body).toHaveProperty("total");
            expect(response.body).toHaveProperty("data");
        });
    });
});
