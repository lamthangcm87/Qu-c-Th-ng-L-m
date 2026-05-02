import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Database Initialization
  const db = new Database('database.db');
  
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS Users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      role_type TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Tasks (
      task_id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_name TEXT NOT NULL,
      budget DECIMAL(15, 2),
      manager_id INTEGER,
      assignee_id INTEGER,
      supervisor_id INTEGER,
      status TEXT DEFAULT 'Pending',
      deadline TEXT,
      FOREIGN KEY (manager_id) REFERENCES Users(user_id),
      FOREIGN KEY (assignee_id) REFERENCES Users(user_id),
      FOREIGN KEY (supervisor_id) REFERENCES Users(user_id)
    );
  `);

  // Seed initial users if empty
  const userCount = db.prepare('SELECT count(*) as count FROM Users').get() as { count: number };
  if (userCount.count === 0) {
    const insertUser = db.prepare('INSERT INTO Users (full_name, role_type) VALUES (?, ?)');
    insertUser.run('Nguyễn Văn A', 'Quản lý');
    insertUser.run('Trần Thị B', 'Quản lý');
    insertUser.run('Lê Văn C', 'Thực thi');
    insertUser.run('Phạm Văn D', 'Thực thi');
    insertUser.run('Hoàng Thị E', 'Giám sát');
    insertUser.run('Đặng Văn F', 'Giám sát');
  }

  app.use(express.json());

  // API Routes
  app.get('/api/users', (req, res) => {
    const users = db.prepare('SELECT * FROM Users ORDER BY full_name ASC').all();
    res.json(users);
  });

  app.post('/api/users', (req, res) => {
    const { full_name, role_type } = req.body;
    try {
      const stmt = db.prepare('INSERT INTO Users (full_name, role_type) VALUES (?, ?)');
      const info = stmt.run(full_name, role_type);
      res.json({ id: info.lastInsertRowid });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    try {
      // Logic: Xoá user. SQLite sẽ tự động set NULL cho các cột Foreign Key nếu được config 
      // hoặc ta có thể chủ động cập nhật các Task liên quan về NULL trước khi xoá.
      // Ở đây đơn giản là xoá user khỏi bảng Users.
      const stmt = db.prepare('DELETE FROM Users WHERE user_id = ?');
      stmt.run(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/tasks', (req, res) => {
    const tasks = db.prepare(`
      SELECT 
        t.*, 
        m.full_name as manager_name,
        a.full_name as assignee_name,
        s.full_name as supervisor_name
      FROM Tasks t
      LEFT JOIN Users m ON t.manager_id = m.user_id
      LEFT JOIN Users a ON t.assignee_id = a.user_id
      LEFT JOIN Users s ON t.supervisor_id = s.user_id
      ORDER BY t.task_id DESC
    `).all();
    res.json(tasks);
  });

  app.post('/api/tasks', (req, res) => {
    const { task_name, budget, manager_id, assignee_id, supervisor_id, deadline } = req.body;
    try {
      const stmt = db.prepare(`
        INSERT INTO Tasks (task_name, budget, manager_id, assignee_id, supervisor_id, deadline)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(task_name, budget, manager_id, assignee_id, supervisor_id, deadline);
      res.json({ id: info.lastInsertRowid });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
