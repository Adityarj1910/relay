import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({
    path: './env'
});

const app = express(); //initialize express
app.use(cors()); //to allow requests from different origins
app.use(express.json()); //to parse JSON data   

// DB Connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log("DB Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));




// Root route
app.get("/", (req, res) => {
    res.json({ message: "Relay API is running..." });
});

//Routes 

import userRouter from './routes/user.routes.js'

//routes declaration

// app.get -> we could have done when we were writing routes here itself.
//but since we have a seperate routes, we will have to import them here and write routes in them only

app.use('/users', userRouter)
//http://localhost:5000/users/register -> this will be url for register
