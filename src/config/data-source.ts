import "reflect-metadata";
import { DataSource } from "typeorm";
import { Config } from ".";
import { User } from "../entity/User";
import { RefreshToken } from "../entity/RefreshToken";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: Config.DB_HOST,
    port: Number(Config.DB_PORT),
    username: Config.DB_USERNAME,
    password: Config.DB_PASSWORD,
    database: Config.DB_NAME,
    // Dont use this in production Always Keep false
    synchronize: true,
    logging: false,
    entities: [User, RefreshToken],
    migrations: [],
    subscribers: [],
});
