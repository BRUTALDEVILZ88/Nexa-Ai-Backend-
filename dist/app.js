import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { config } from "dotenv";
config();
const app = express();
// ✅ Move CORS to the absolute top BEFORE anything else
app.use(cors({
    origin: [
        "https://nexa-ai-frontend-sigma.vercel.app",
        "http://localhost:5173",
        "https://nexa-ai-frontend-4o6cv8b3o-rishitas-projects.vercel.app"
    ],
    credentials: true,
}));
// ✅ Also handle preflight
app.options("*", cors({
    origin: [
        "https://nexa-ai-frontend-sigma.vercel.app",
        "http://localhost:5173",
        "https://nexa-ai-frontend-4o6cv8b3o-rishitas-projects.vercel.app"
    ],
    credentials: true,
}));
// Middleware
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(morgan("dev"));
// Root check
app.get("/", (req, res) => {
    res.send("✅ Nexa AI Backend is running!");
});
// Routes
import appRouter from "./routes/index.js";
app.use("/api/v1", appRouter);
export default app;
//# sourceMappingURL=app.js.map