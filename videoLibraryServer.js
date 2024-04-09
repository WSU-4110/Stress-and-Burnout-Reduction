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
  queueLimit: 0,
  authPlugins: {
    mysql_clear_password: () => () => Buffer.from('Milkmoney2003withSql!\0')
  },
});

// Updated endpoint for liking videos using videoId from the URL
app.post('/videos/:videoId/like', async (req, res) => {
  const { videoId } = req.params;
  const { userId } = req.body; 
  const query = 'INSERT INTO likes (video_id, user_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE video_id=video_id';
  try {
    const [result] = await pool.query(query, [videoId, userId]);
    res.json({ message: `Video ${videoId} liked by user ${userId}` });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'An error occurred while liking the video.' });
  }
});

// Existing endpoint for unliking videos
app.post('/unlike', async (req, res) => {
  const { videoId, userId } = req.body;
  const query = 'DELETE FROM likes WHERE video_id = ? AND user_id = ?';
  try {
    const [result] = await pool.query(query, [videoId, userId]);
    res.send('Video unliked!');
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'An error occurred while unliking the video.' });
  }
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
const PORT = process.env.PORT || 3300;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});