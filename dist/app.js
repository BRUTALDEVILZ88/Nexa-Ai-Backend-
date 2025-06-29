import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { config } from "dotenv";
config();
const app = express();
const allowedOrigins = [
    "https://nexa-ai-frontend-six.vercel.app",
    "http://localhost:5173"
];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));
// Middleware
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(morgan("dev"));
// Root check
app.get("/", (req, res) => {
    res.send(" Nexa AI Backend is running!");
});
// Routes
import appRouter from "./routes/index.js";
app.use("/api/v1", appRouter);
export default app;
//# sourceMappingURL=app.js.map