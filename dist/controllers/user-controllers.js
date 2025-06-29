import User from "../models/User.js";
import { hash, compare } from "bcrypt";
import { createToken } from "../utils/token-manager.js";
import { COOKIE_NAME } from "../utils/constants.js";
const isProd = process.env.NODE_ENV === "production";
export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        return res.status(200).json({ message: "OK", users });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "ERROR", cause: error.message });
    }
};
export const userSignup = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(401).send("User already registered");
        const hashedPassword = await hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        console.log("Setting cookie with SameSite =", isProd ? "none" : "lax");
        // ❌ Removed res.clearCookie() – this caused expired Set-Cookie header
        const token = createToken(user._id.toString(), user.email, "7d");
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);
        res.cookie(COOKIE_NAME, token, {
            path: "/",
            httpOnly: true,
            signed: true,
            sameSite: isProd ? "none" : "lax",
            secure: isProd,
            expires,
        });
        return res.status(201).json({
            message: "OK",
            name: user.name,
            email: user.email,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "ERROR", cause: error.message });
    }
};
export const userLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user)
            return res.status(401).send("User not registered");
        const isPasswordCorrect = await compare(password, user.password);
        if (!isPasswordCorrect)
            return res.status(403).send("Incorrect Password");
        console.log("Setting cookie with SameSite =", isProd ? "none" : "lax");
        // ❌ Removed res.clearCookie() here as well — was sending Expires=1970
        const token = createToken(user._id.toString(), user.email, "7d");
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);
        res.cookie(COOKIE_NAME, token, {
            path: "/",
            httpOnly: true,
            signed: true,
            sameSite: isProd ? "none" : "lax",
            secure: isProd,
            expires,
        });
        return res.status(200).json({
            message: "OK",
            name: user.name,
            email: user.email,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "ERROR", cause: error.message });
    }
};
export const verifyUser = async (req, res, next) => {
    try {
        const user = await User.findById(res.locals.jwtData.id);
        if (!user)
            return res
                .status(401)
                .send("User not registered OR Token malfunctioned");
        if (user._id.toString() !== res.locals.jwtData.id) {
            return res.status(401).send("Permissions didn't match");
        }
        return res.status(200).json({
            message: "OK",
            name: user.name,
            email: user.email,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "ERROR", cause: error.message });
    }
};
export const userLogout = async (req, res, next) => {
    try {
        const user = await User.findById(res.locals.jwtData.id);
        if (!user)
            return res
                .status(401)
                .send("User not registered OR Token malfunctioned");
        if (user._id.toString() !== res.locals.jwtData.id) {
            return res.status(401).send("Permissions didn't match");
        }
        // ✅ KEEP clearCookie here — this is logout, so you want to expire it
        res.clearCookie(COOKIE_NAME, {
            httpOnly: true,
            path: "/",
            signed: true,
            sameSite: isProd ? "none" : "lax",
            secure: isProd,
        });
        return res.status(200).json({
            message: "OK",
            name: user.name,
            email: user.email,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "ERROR", cause: error.message });
    }
};
//# sourceMappingURL=user-controllers.js.map