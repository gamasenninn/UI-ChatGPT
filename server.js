const express = require('express');
const app = express();
const port = 3001;
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

app.use(bodyParser.json());

// SQLite データベースへの接続
let db = new sqlite3.Database('./addressbook.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
});

// テーブルがない場合は作成
db.run(`CREATE TABLE IF NOT EXISTS entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT NOT NULL
)`);

// エントリーを取得
app.get('/entries', (req, res) => {
  db.all('SELECT * FROM entries', [], (err, rows) => {
    if (err) {
      throw err;
    }
    res.json(rows);
  });
});

// エントリーを作成
app.post('/entries', (req, res) => {
  const { name, address } = req.body;
  db.run(`INSERT INTO entries (name, address) VALUES (?, ?)`, [name, address], function(err) {
    if (err) {
      return console.error(err.message);
    }
    res.json({ id: this.lastID });
  });
});

// エントリーを更新
app.put('/entries/:id', (req, res) => {
  const { name, address } = req.body;
  db.run(`UPDATE entries SET name = ?, address = ? WHERE id = ?`, [name, address, req.params.id], function(err) {
    if (err) {
      return console.error(err.message);
    }
    res.json({ changes: this.changes });
  });
});

// エントリーを削除
app.delete('/entries/:id', (req, res) => {
  db.run(`DELETE FROM entries WHERE id = ?`, req.params.id, function(err) {
    if (err) {
      return console.error(err.message);
    }
    res.json({ changes: this.changes });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
