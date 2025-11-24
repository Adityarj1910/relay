import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express(); //initialize express
app.use(cors()); //to allow requests from different origins
app.use(express.json()); //to parse JSON data   

// DB Connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log("DB Error:", err));

// Root route
app.get("/", (req, res) => {
    res.json({ message: "Relay API is running..." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
