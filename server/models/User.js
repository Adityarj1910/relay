import mongoose from 'mongoose';
const { Schema } = mongoose;
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
        },
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true
        },
        phoneNumber: {
            type: String,
            required: [true, "Phone number is required"],
            unique: true,
            index: true,
            match: [/^[0-9]{10}$/, "Phone number must be 10 digits"],
        },
        email: {
            type: String,
            // required: [true, "Email is required"],
            trim: true,
            lowercase: true,
            unique: true,
            sparse: true
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            // trim: true,
            minlength: [6, "Password must be at least 6 characters long"],
        },
    },
    { timestamps: true }
);

userSchema.pre('save', async function (next) { // Hash password before saving
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next(); // Move to next middleware
});

userSchema.methods.comparePassword = async function (password) { // Compare password before logging in
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () { // Generate token 
    return jwt.sign(
        {
            _id: this._id,
            phoneNumber: this.phoneNumber,
            username: this.username,
            email: this.email,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

userSchema.methods.generateRefreshToken = function () { // Generate refresh token
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};
export const User = mongoose.model('User', userSchema);
