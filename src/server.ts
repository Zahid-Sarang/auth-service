import app from "./app";
import { Config } from "./config";

const startServer = () => {
    const PORT = Config.PORT;
    try {
        app.listen(PORT, () => {
            // eslint-disable-next-line no-console
            console.log(`Listing on port ${PORT}`);
        });
    } catch (error) {
        // eslint-disable-next-line no-console
        console.log(`Failed to listen on port ${PORT}`, error);
        process.exit(1);
    }
};

startServer();
