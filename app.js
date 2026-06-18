require("dotenv").config();
const express = require("express");
const { connectDB } = require("./src/config/db");
const { setEndpoints } = require("./src/services/rubikaApi.service");
const { setCommands } = require("./src/services/command.service");
const webhookRoutes = require("./src/routers/webhook.router");


const app = express();
app.use(express.json());

app.use("/", webhookRoutes);

async function bootstrap() {
    try {
        await connectDB();
        await setEndpoints();
        await setCommands();

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log("Bot Server Running:", PORT);
        });
    } catch (error) {
        console.error("Bootstrap Error:", error);
        process.exit(1);
    }
}

bootstrap();
