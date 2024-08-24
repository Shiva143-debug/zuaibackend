
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

const pool = new Pool({
    user: 'oss_admin',
    host: '148.72.246.179',
    database: 'zuai',
    password: 'Latitude77',
    schema:"public",
    port: '5432', 
});


app.get('/posts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM posts ORDER BY date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});


app.get('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM posts WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).send('Post not found');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});


app.get('/posts/:postId/comments', async (req, res) => {
    const { postId } = req.params;
    try {
        const result = await pool.query('SELECT * FROM comments WHERE post_id = $1', [postId]);
        res.send(result.rows);
    } catch (error) {
        res.status(500).send('Server error');
    }
});


app.post('/posts', async (req, res) => {
  try {
    const {name, title, content } = req.body;
    const result = await pool.query(
      'INSERT INTO posts (name, title, content) VALUES ($1, $2,$3) RETURNING *',
      [name, title, content]
    );
    res.status(201).json("post is successfully uploaded");
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});


app.post('/posts/:postId/comments', async (req, res) => {
    const { postId } = req.params;
    const { comment } = req.body;
    if (!comment) return res.status(400).send('comment is required');

    try {
        const result = await pool.query(
            'INSERT INTO comments (post_id, comment) VALUES ($1, $2) RETURNING *',
            [postId, comment]
        );
        res.status(201).send(result.rows[0]);
    } catch (error) {
        res.status(500).send('Server error');
    }
});



app.put('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name,title, content } = req.body;
    const result = await pool.query(
      'UPDATE posts SET  name = $1 , title = $2, content = $3, date = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [name ,title, content, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send('Post not found');
    }
    res.json("post updated successully");
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});


app.delete('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id)
    const result = await pool.query('DELETE FROM posts WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).send('Post not found');
    }
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});



// Delete a comment by ID
app.delete('/posts/:postId/comments/:commentId', async (req, res) => {
    const { postId, commentId } = req.params;
    try {
        await pool.query('DELETE FROM comments WHERE id = $1 AND post_id = $2', [commentId, postId]);
        res.send({ message: 'Comment deleted' });
    } catch (error) {
        res.status(500).send('Server error');
    }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
