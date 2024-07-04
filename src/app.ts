import "reflect-metadata";
import express from "express";

import authRouter from "./routes/auth";
import tenantRouter from "./routes/tenant";
import userRouter from "./routes/user";
import cookieParser from "cookie-parser";
import cors from "cors";
import { Config } from "./config";
import { globalErrorHandler } from "./middleware/globalErrorHandler";

const app = express();

const ALLOWED_DOMAINS = [Config.ADMIN_URL!, Config.CLIENT_URL!];

app.use(
    cors({
        origin: ALLOWED_DOMAINS,
        credentials: true,
    }),
);
app.use(express.static("public"));
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("welcome to the app");
});

app.use("/auth", authRouter);
app.use("/tenants", tenantRouter);
app.use("/users", userRouter);

app.use(globalErrorHandler);

export default app;
