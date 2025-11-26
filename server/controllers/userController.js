import { User } from "../models/User.js";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const generateAccessTokenAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken //save to database
        await user.save({ validateBeforeSave: false })//no need to update password atm. 

        //return the accessToken and refreshToken
        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens")
    }
}

const registerUser = asyncHandler(async (req, res) => {

    const { name, username, phoneNumber, email, password } = req.body;
    if (
        [name, phoneNumber, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All feilds are required.")
    }

    const existingUserName = await User.findOne({ username })
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
        username: username.toLowerCase(),
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


const loginUser = asyncHandler(async (req, res) => {
    //req body -> data
    //username and phonenuber
    //find user
    //password check
    //accesss and refresh token
    //send cokkie

    const { phoneNumber, username, password } = req.body;

    if (!phoneNumber || !username) {
        throw new ApiError(400, "Phone Number or Username is required")
    }

    const user = await User.findOne({ //this user is fetched from User db
        //user and User are distinct
        $or: [{ username }, { phoneNumber }]
    })

    if (!user) {
        throw new ApiError(404, "User Does not Exist. Please Login")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(403, "Invalid User Credentials")
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshTokens(user._id)
    //we have refresh token but is not yet updated in db, so

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    //we dont want password and refToken hence .select()


    //cookie
    const options = {
        httpOnly: true, //means cokkie will only be modified by the server and cant be modified by frontend
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options) //from cookie-parser
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(201, {
                user: loggedInUser, accessToken, refreshToken
            }, "User Logged In Successfully")
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    //clear cookies
    //reset refreshToken from db
    //but where do we get user from -> middleware

    //from middleware/auth.js 

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:
            {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .clearCookie("accessToken", options)
        .clearCookie("refreshCookie", options)
        .json(
            new ApiResponse(200, {}, "User Logged Out Successfully")
        )
})

export {
    registerUser,
    loginUser,
    logoutUser
}