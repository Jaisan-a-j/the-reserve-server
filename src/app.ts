import express from "express";
import cors from "cors";
import authRoutes from "./routes/userRoute";
import bookingRoutes from "./routes/bookingRoute";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
export default app;
