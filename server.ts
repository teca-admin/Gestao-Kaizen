import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const db = new Database("infra.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE,
    name TEXT,
    description TEXT,
    leader TEXT,
    shift TEXT,
    sector TEXT,
    date TEXT,
    supervisor TEXT,
    os_vinci TEXT,
    photo TEXT,
    status TEXT DEFAULT 'Pendente'
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    if (username === "admin" && password === "admin") {
      res.json({ success: true, user: { name: "Admin Líder", role: "leader" } });
    } else {
      res.status(401).json({ success: false, message: "Credenciais inválidas" });
    }
  });

  app.get("/api/events", (req, res) => {
    const events = db.prepare("SELECT * FROM events ORDER BY id DESC").all();
    res.json(events);
  });

  app.post("/api/events", (req, res) => {
    const event = req.body;
    const stmt = db.prepare(`
      INSERT INTO events (code, name, description, leader, shift, sector, date, supervisor, os_vinci, photo, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    try {
      const result = stmt.run(
        event.code,
        event.name,
        event.description,
        event.leader,
        event.shift,
        event.sector,
        event.date,
        event.supervisor,
        event.os_vinci,
        event.photo,
        event.status || 'Pendente'
      );
      res.json({ success: true, id: result.lastInsertRowid });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.patch("/api/events/:id/status", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const stmt = db.prepare("UPDATE events SET status = ? WHERE id = ?");
    stmt.run(status, id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve("dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
