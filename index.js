// index.js
const express = require("express");
const TogetherClient = require("./Client.js");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");
const path = require("path");

dotenv.config(); // Load environment variables

const app = express();
const PORT = 3000; // Server port
const PASSWORD = process.env.PASSWORD; // Password from .env
const API_KEY = process.env["TOGETHER_API_KEY"]; // API Key from .env
const RATE_LIMIT = 100;

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: parseInt(RATE_LIMIT, 10), // Limit each IP to X requests per hour (from .env)
  message: "Too many requests, please try again later.",
});

app.use(express.json());
app.use(limiter);

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, "public")));

// Route for AI chat
app.post("/chat", async (req, res) => {
  const { password, messages } = req.body;

  // Check for correct password
  if (password !== PASSWORD) {
    return res.status(401).json({ error: "Unauthorized: Incorrect password" });
  }

  // Initialize the TogetherClient with API key
  const client = new TogetherClient(API_KEY);

  // Use the specified AI model
  const model = "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo";

  try {
    // Create a chat completion stream
    const stream = await client.chat(model, messages, false);

    // Respond with the chat result
    res.json({ response: stream.choices[0].message.content });
  } catch (err) {
    console.error("Failed to complete chat:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});