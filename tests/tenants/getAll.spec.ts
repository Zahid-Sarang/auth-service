import { DataSource } from "typeorm";

import request from "supertest";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { Tenant } from "../../src/entity/Tenant";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../src/constants";

describe("GET /tenants", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;
    let adminToken: string;

    beforeAll(async () => {
        jwks = createJWKSMock("http://localhost:8000");
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();

        adminToken = jwks.token({
            sub: "1",
            role: Roles.ADMIN,
        });
    });
    afterEach(() => {
        jwks.stop();
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
                .set("Cookie", [`accessToken=${adminToken}`])
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

            const tenantRepository = connection.getRepository(Tenant);
            const tenant = await tenantRepository.save(tenantData);
            const response = await request(app)
                .get("/tenants")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(tenantData);
            expect(response.body).toHaveLength(tenant.length);
        });
        it("should return a 403 status code if non admin user try to access", async () => {
            const managerToken = jwks.token({
                sub: "1",
                role: Roles.MANAGER,
            });
            const tenantData = {
                name: "Tenant Name",
                address: "Tenant Address",
            };

            const tenantRepository = connection.getRepository(Tenant);
            await tenantRepository.save(tenantData);
            const response = await request(app)
                .get("/tenants")
                .set("Cookie", [`accessToken=${managerToken}`])
                .send(tenantData);

            expect(response.statusCode).toBe(403);
        });
    });
});
