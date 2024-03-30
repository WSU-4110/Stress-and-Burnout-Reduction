const express = require('express');
const mysql = require('mysql2/promise');

// Create a new Express application
const app = express();
app.use(express.json());

// Setup MySQL connection
const pool = mysql.createPool({
  host: 'localhost',
  user: 'Cnlos',
  database: 'stressandburnoutreduction',
  password: 'Milkmoney2003withMySql!',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Endpoint for liking videos
app.post('/videos/:videoId/like', async (req, res) => {
  const { videoId } = req.params;
  const { userId } = req.body;

  try {
    const [result] = await pool.query(
      'INSERT INTO likes (video_id, user_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE like_id=LAST_INSERT_ID(like_id)',
      [videoId, userId]
    );
    res.status(200).json({ message: 'Video liked successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint for unliking videos
app.delete('/videos/:videoId/like', async (req, res) => {
  const { videoId } = req.params;
  const { userId } = req.body;

  try {
    const [result] = await pool.query(
      'DELETE FROM likes WHERE video_id = ? AND user_id = ?',
      [videoId, userId]
    );
    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Like removed successfully' });
    } else {
      res.status(404).json({ message: 'Like not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3300;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});