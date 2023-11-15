import { DataSource } from "typeorm";

import request from "supertest";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { Tenant } from "../../src/entity/Tenant";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../src/constants";

describe("DELETE /tenants/:id", () => {
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
            const tenant = await tenantRepository.save(tenantData);
            const response = await request(app)
                .delete(`/tenants/${tenant.id}`)
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(tenantData);

            expect(response.statusCode).toBe(200);
        });
        it("should check tenant not persist in database ", async () => {
            const tenantData = {
                name: "Tenant Name",
                address: "Tenant Address",
            };

            const tenantRepository = connection.getRepository(Tenant);
            const tenant = await tenantRepository.save(tenantData);
            await request(app)
                .delete(`/tenants/${tenant.id}`)
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(tenantData);

            const deleteTenat = await tenantRepository.find();
            expect(deleteTenat).toHaveLength(0);
        });
    });
});
