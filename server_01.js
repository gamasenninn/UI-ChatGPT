const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

// ミドルウェア
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// SQLite データベースのセットアップ
const db = new sqlite3.Database('./addressbook.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the SQlite database.');
});

// テーブルの作成
db.run(`CREATE TABLE IF NOT EXISTS entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT NOT NULL
)`);

// エントリーの取得
app.get('/entries', (req, res) => {
  db.all("SELECT * FROM entries", [], (err, rows) => {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({
      "message": "success",
      "data": rows
    });
  });
});

// エントリーの追加
app.post('/entries', (req, res) => {
  const { name, address } = req.body;
  db.run(`INSERT INTO entries (name, address) VALUES (?, ?)`, [name, address], function (err) {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({
      "message": "success",
      "data": { id: this.lastID }
    });
  });
});

// エントリーの更新
app.patch('/entries/:id', (req, res) => {
  const { name, address } = req.body;
  db.run(`UPDATE entries SET name = ?, address = ? WHERE id = ?`, [name, address, req.params.id], function (err) {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({
      "message": "success",
      "data": { name, address },
      "changes": this.changes
    });
  });
});

// エントリーの削除
app.delete('/entries/:id', (req, res) => {
  db.run(`DELETE FROM entries WHERE id = ?`, req.params.id, function (err) {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({ "message": "deleted", changes: this.changes });
  });
});

// サーバーの起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

// データベースのクローズ
process.on('SIGINT', () => {
  db.close(() => {
    console.log('DB connection closed');
    process.exit(0);
  });
});
