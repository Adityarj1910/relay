import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();



// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser()); // Parse cookies

// DB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log("DB Error:", err));

app.get("/", (req, res) => {
    res.json({ message: "Relay API is running..." });
});

// ROUTES
import userRouter from "./routes/user.routes.js";
app.use("/api/v1/users", userRouter); // Fixed: added leading slash


app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Server error"
    });
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
