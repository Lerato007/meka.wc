import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import payfastRoutes from "./routes/payfastRoutes.js";

const port = process.env.PORT || 5000;

connectDB();

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
// credentials: true is required so the browser sends the jwt cookie
// across origins (dev: 3000 → 5000)
app.use(
  cors({
    origin:      process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/products", productRoutes);
app.use("/api/users",    userRoutes);
app.use("/api/orders",   orderRoutes);
app.use("/api/upload",   uploadRoutes);
app.use("/api/payfast",  payfastRoutes);

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/api/test", (req, res) => {
  res.json({ cookies: req.cookies, headers: req.headers });
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"))
  );
} else {
  app.get("/", (req, res) => res.send("API is running...."));
}

app.use(notFound);
app.use(errorHandler);

app.listen(port, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`)
);