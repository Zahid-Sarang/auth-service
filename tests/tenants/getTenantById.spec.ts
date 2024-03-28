import { DataSource } from "typeorm";

import request from "supertest";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { Tenant } from "../../src/entity/Tenant";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../src/constants";
import { JWKS_MOCK_URL } from "../utils";

describe("GET /tenants/:id", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;
    let adminToken: string;

    beforeAll(async () => {
        jwks = createJWKSMock(JWKS_MOCK_URL);
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
            const tenantId = tenant.id;
            const response = await request(app)
                .get(`/tenants/${tenantId}`)
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(tenantData);

            expect(response.statusCode).toBe(200);
        });
        it("should return a tenant by Id", async () => {
            const tenantData = {
                name: "Tenant Name",
                address: "Tenant Address",
            };

            const tenantRepository = connection.getRepository(Tenant);
            const tenant = await tenantRepository.save(tenantData);
            const tenantId = tenant.id;
            const response = await request(app)
                .get(`/tenants/${tenantId}`)
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(tenantData);

            expect((response.body as Record<string, string>).id).toBe(
                tenant.id,
            );
            expect((response.body as Record<string, string>).name).toBe(
                tenant.name,
            );
            expect((response.body as Record<string, string>).address).toBe(
                tenant.address,
            );
        });
    });
});
