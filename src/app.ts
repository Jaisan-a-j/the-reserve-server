import express from "express";
import cors from "cors";
import authRoutes from "./routes/userRoute";
import bookingRoutes from "./routes/bookingRoute";
import foodRoutes from "./routes/foodRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/food", foodRoutes);
export default app;
