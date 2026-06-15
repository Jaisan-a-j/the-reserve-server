import express from "express";
import cors from "cors";
import authRoutes from "./routes/userRoute";
import bookingRoutes from "./routes/bookingRoute";
import foodRoutes from "./routes/foodRoutes";
import cartRoutes from "./routes/cartRoute";
import orderRoutes from "./routes/orderRoute";
import chatRoutes from "./routes/chatRoute";
import reviewRoutes from "./routes/reviewRoute";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/reviews", reviewRoutes);
export default app;
