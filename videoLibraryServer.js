const express = require('express');
const mysql = require('mysql2/promise');

// Create a new Express application
const app = express();
app.use(express.json());

// Setup MySQL connection
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'stressandburnoutreduction',
  password: 'Milkmoney2003withSql!',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Endpoint for liking videos
app.post('/like', (req, res) => {
  const { videoId, userId } = req.body;
  const query = 'INSERT INTO likes (video_id, user_id) VALUES (?, ?)';
  pool.query(query, [videoId, userId], (err, result) => {
    if (err) throw err;
    res.send('Video liked!');
  });
});

// Endpoint for unliking videos
app.post('/unlike', (req, res) => {
  const { videoId, userId } = req.body;
  const query = 'DELETE FROM likes WHERE video_id = ? AND user_id = ?';
  pool.query(query, [videoId, userId], (err, result) => {
    if (err) throw err;
    res.send('Video unliked!');
  });
});

// Sorting videos by likes
app.get('/videos', (req, res) => {
  const query = 'SELECT * FROM videos ORDER BY likes DESC';
  pool.query(query, (err, rows) => {
    if (err) throw err;
    res.json(rows);
  });
});


// Start the server
const PORT = process.env.PORT || 3309;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});