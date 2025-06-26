
import { config } from "dotenv";
config();
import express from "express";
const app = express();
import morgan from "morgan";
import appRouter from "./routes/index.js";
import cookieParser from "cookie-parser";
import cors from "cors";


app.use(cors({
  origin: [
     "https://nexa-ai-frontend-sigma.vercel.app",
    "http://localhost:5173", // for local dev
    "https://nexa-ai-frontend-4o6cv8b3o-rishitas-projects.vercel.app" // for production
  ],
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

//remove it in production
app.use(morgan("dev"));
app.get("/", (req, res) => {
  res.send("✅ Nexa AI Backend is running!");
});
app.use("/api/v1", appRouter);

export default app;
