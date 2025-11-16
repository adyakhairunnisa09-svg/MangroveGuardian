const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const app = express();
app.use(express.json());

// Koneksi ke MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Atlas Connected'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Endpoint POST: simpan user baru
app.post('/api/users', async (req, res) => {
  try {
    const { name, email, age } = req.body;
    const newUser = new User({ name, email, age });
    await newUser.save();
    res.status(201).json({ message: '✅ User saved successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ message: '❌ Error saving user', error });
  }
});

// Endpoint GET: ambil semua user
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: '❌ Error fetching users', error });
  }
});

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

import http from "http";
import fetch from "node-fetch";
import cors from "cors";
import express from "express";

const app = express();

const PORT = 3000;
const API_KEY = "AIzaSyCbZWRtBFEQJcqvg57k9XZjiZqK1bacz6A"; // 👉 ganti dengan API key dari aistudio.google.com

app.use(cors({ origin: "*", methods: ["GET", "POST", "OPTIONS"], allowedHeaders: ["Content-Type"] }));

app.use(express.json());

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }],
        }),
      }
    );

    const data = await response.json();
    console.log("Response dari Gemini:", data);

    let reply = "⚠️ Tidak ada respons dari Gemini.";
    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      reply = data.candidates[0].content.parts[0].text;
    }

    res.json({ reply });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ reply: "⚠️ Terjadi kesalahan di server Node.js." });
  }
});

app.listen(PORT, () => console.log(`🚀 Server berjalan di http://localhost:${PORT}`));

