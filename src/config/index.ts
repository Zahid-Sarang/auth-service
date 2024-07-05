import { config } from "dotenv";
import path from "path";
config({
    path: path.join(__dirname, `../../.env.${process.env.NODE_ENV || "dev"}`),
});

const {
    PORT,
    NODE_ENV,
    DB_HOST,
    DB_PORT,
    DB_USERNAME,
    DB_PASSWORD,
    DB_NAME,
    REFRESH_TOKEN_SECRET,
    JWKS_URI,
    PRIVATE_KEY,
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
    ADMIN_URL,
    CLIENT_URL,
    MAIN_DOMAIN,
} = process.env;

export const Config = {
    PORT,
    NODE_ENV,
    DB_HOST,
    DB_PORT,
    DB_USERNAME,
    DB_PASSWORD,
    DB_NAME,
    REFRESH_TOKEN_SECRET,
    JWKS_URI,
    PRIVATE_KEY,
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
    ADMIN_URL,
    CLIENT_URL,
    MAIN_DOMAIN,
};
