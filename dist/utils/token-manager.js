import jwt from "jsonwebtoken";
import { COOKIE_NAME } from "./constants.js";
export const createToken = (id, email, expiresIn) => {
    const payload = { id, email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
    return token;
};
export const verifyToken = async (req, res, next) => {
    console.log("Cookies Received:", req.cookies);
    console.log("Signed Cookies:", req.signedCookies);
    let token = req.signedCookies[`${COOKIE_NAME}`];
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token || token.trim() === "") {
        return res.status(401).json({ message: "Token Not Received" });
    }
    try {
        const success = jwt.verify(token, process.env.JWT_SECRET);
        res.locals.jwtData = success;
        return next();
    }
    catch (err) {
        return res.status(401).json({ message: "Token Expired or Invalid" });
    }
};
//# sourceMappingURL=token-manager.js.map