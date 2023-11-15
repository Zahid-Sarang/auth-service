import { DataSource } from "typeorm";

import request from "supertest";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { Tenant } from "../../src/entity/Tenant";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../src/constants";

describe("PATCH /tenants/:id", () => {
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
        it("should return a 201 status code", async () => {
            const tenantData = {
                name: "Tenant Name",
                address: "Tenant Address",
            };

            const tenantRepository = connection.getRepository(Tenant);
            const tenant = await tenantRepository.save(tenantData);
            const response = await request(app)
                .patch(`/tenants/${tenant.id}`)
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(tenantData);

            expect(response.statusCode).toBe(200);
        });
        it("should return updated tenant Data", async () => {
            const tenantData = {
                name: "Tenant Name",
                address: "Tenant Address",
            };

            const tenantRepository = connection.getRepository(Tenant);
            const tenant = await tenantRepository.save(tenantData);

            const updateData = {
                name: "jhone",
                address: "Mumbai",
            };
            const response = await request(app)
                .patch(`/tenants/${tenant.id}`)
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(updateData);

            const findTenant = await tenantRepository.findOne({
                where: {
                    id: Number((response.body as Record<string, string>).id),
                },
            });
            expect(findTenant?.name).toBe(updateData.name);
            expect(findTenant?.address).toBe(updateData.address);
        });
    });
});
