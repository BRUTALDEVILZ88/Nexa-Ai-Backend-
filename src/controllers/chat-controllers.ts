import { Request, Response, NextFunction } from "express";
import User from "../models/User.js";
import { genAI } from "../config/gemini.js";

const userLastCallMap = new Map<string, number>();

// -------------------- Generate Chat Completion --------------------

export const generateChatCompletion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ message: "Message is required" });
  }

  try {
    const userId = res.locals.jwtData.id;
    const now = Date.now();
    const lastCall = userLastCallMap.get(userId);

    // ✅ Rate limit (3 sec gap)
    if (lastCall && now - lastCall < 3000) {
      return res.status(429).json({
        message: "Too many requests. Please wait a few seconds before trying again.",
      });
    }

    userLastCallMap.set(userId, now);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "User not registered OR Token malfunctioned" });
    }

    // ✅ Convert existing chats to Gemini format
    const chatHistory = user.chats.map((chat) => ({
      role: chat.role,
      parts: [{ text: chat.content }],
    }));

    // ➕ Add new user message
    chatHistory.push({
      role: "user",
      parts: [{ text: message }],
    });

    // 💾 Save user message before Gemini reply
    user.chats.push({ content: message, role: "user" });

    // 🔥 Gemini v2.0 API call
    const result = await genAI.models.generateContent({
      model: "models/gemini-1.5-flash",
      contents: chatHistory,
    });

    const responseText = result.text || "No response from Gemini";

    // 💾 Save Gemini reply
    user.chats.push({ content: responseText, role: "assistant" });
    await user.save();

    return res.status(200).json({ chats: user.chats });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ message: "Something went wrong with Gemini API" });
  }
};

// -------------------- Send All Chats --------------------

export const sendChatsToUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).send("User not registered OR Token malfunctioned");
    }

    return res.status(200).json({ message: "OK", chats: user.chats });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: "ERROR", cause: error.message });
  }
};

// -------------------- Delete All Chats --------------------

export const deleteChats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).send("User not registered OR Token malfunctioned");
    }

    user.chats.splice(0, user.chats.length);

    await user.save();

    return res.status(200).json({ message: "OK" });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: "ERROR", cause: error.message });
  }
};
