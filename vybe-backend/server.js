const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Render's secure cloud connection
  }
});

// Test Database Connection immediately on start
pool.connect((err) => {
  if (err) console.error("❌ DATABASE CONNECTION ERROR:", err.message);
  else console.log("✅ DATABASE CONNECTED SUCCESSFULLY");
});

app.use(cors());
app.use(express.json());

const SECRET = "UST_IS_SECURE_2026";

app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hash = await bcrypt.hash(password, 10);
        const result = await pool.query(
            "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username",
            [username, hash]
        );
        console.log(`✅ User Registered: ${username}`);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("❌ Register Error:", err.message);
        res.status(400).json({ error: "Username already exists." });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        if (result.rows.length > 0) {
            const match = await bcrypt.compare(password, result.rows[0].password_hash);
            if (match) {
                const token = jwt.sign({ id: result.rows[0].id, user: username }, SECRET);
                console.log(`🔑 User Logged In: ${username}`);
                return res.json({ token, username });
            }
        }
        res.status(401).json({ error: "Invalid credentials." });
    } catch (err) {
        res.status(500).json({ error: "Server error." });
    }
});

io.on('connection', (socket) => {
    socket.on('send_msg', (data) => {
        io.emit('receive_msg', data);
    });
});

// Using your IP for the listener
server.listen(4000, "0.0.0.0", () => {
    console.log("🚀 Vybe Engine Live: http://192.168.56.1:4000");
});