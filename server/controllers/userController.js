import { User } from "../models/User.js";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const registerUser = asyncHandler(async (req, res) => {

    const { name, phoneNumber, email, userName, password, } = req.body;
    if (
        (
            !name ||
            !phoneNumber ||
            !email ||
            !userName ||
            !password
        ).some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All feilds are required.")
    }

    const existingUserName = await User.findOne({ userName })
    if (existingUserName) {
        throw new ApiError(409, "Username already exists.")
    }

    const existingEmail = await User.findOne({ email })
    if (existingEmail) {
        throw new ApiError(409, "Email already exists")
    }

    const existingUser = await User.findOne({ phoneNumber })
    if (existingUser) {
        throw new ApiError(409, "User already exists. Please login.")
    }

    const user = await User.create({
        name,
        userName: userName.toLowerCase(),
        phoneNumber,
        email,
        password
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken" // we return the user without password and refresh token
    )

    if (!createdUser) {
        throw new ApiError(500, "Something Went Wrong")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Succcesfully")
    )

})


export { registerUser }