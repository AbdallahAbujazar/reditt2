const express = require("express");
const pool = require("../config/db");
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const multer = require('multer');


const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/img/posts_images');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const fileExt = file.originalname.split('.').pop();
    cb(null, uniqueSuffix + '.' + fileExt);
  }
});

const upload = multer({ storage: storage });


const createPost =  async (req, res) => {
  upload.single('post_image')(req, res, async function(err) {
    const { title, body } = req.body;
    const post_image = req.file.filename;

    try {
      const token = req.cookies.jwt;
      const decodedToken = jwt.verify(token, "JWT_SECRETs123");
      if (!decodedToken || !decodedToken.user.id) {
        throw new Error("Invalid token");
      }
      const userId = decodedToken.user.id;
      await pool.query(
        'INSERT INTO posts (title, body, user_id, post_image) VALUES ($1, $2, $3, $4)',
        [title, body, userId, post_image]
      );
      res.redirect('/');
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal server error');
    }
  });
};


const createComment = async (req, res) => {
  const { body , user_id, post_id } = req.body;
  try {
    const token = req.cookies.jwt;
    if (!token) {
      throw new Error('No token provided');
    }
    const decodedToken = jwt.verify(token, "JWT_SECRETs123");
    if (!decodedToken || !decodedToken.user.id) {
      throw new Error("Invalid token");
    }
    const userId = decodedToken.user.id;
    const result = await pool.query(
      'INSERT INTO comments (body, user_id, post_id) VALUES ($1, $2, $3) RETURNING id;',
      [body, userId, post_id]
    );
    const commentId = result.rows[0].id;
    res.json({ success: true, commentId: commentId });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
};


  const getTopUsers = async (req, res, next) => {
    try {
      const { rows } = await pool.query(`
        SELECT users.id, users.name, users.profile_image, COUNT(posts.user_id) AS post_count
        FROM users
        LEFT JOIN posts ON users.id = posts.user_id
        GROUP BY users.id, users.name, users.profile_image
        ORDER BY post_count DESC
        LIMIT 30
      `);
      res.locals.topUsers = rows;
      next();
    } catch (error) {
      console.error(error);
      next(error);
    }
  };

const getPopularPosts = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT posts.*, COUNT(comments.id) as comment_count FROM posts LEFT JOIN comments ON posts.id = comments.post_id GROUP BY posts.id ORDER BY comment_count DESC LIMIT 5'
    );
    res.locals.popularPosts = result.rows;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
};

  const getPostById = async (req, res) => {
    const postId = req.params.id;
    try {
      const { rows: posts } = await pool.query(`
      SELECT 
          posts.id as post_id, 
          users.id as user_id, 
          users.name, 
          users.profile_image, 
          posts.title, 
          posts.user_id, 
          posts.body,
          posts.post_image
      FROM posts 
      INNER JOIN users ON posts.user_id = users.id 
      WHERE posts.id = $1
      ORDER BY post_id DESC`, [postId]);
  
      const token = req.cookies.jwt;
      let userId;
  
      if (token) {
        const decodedToken = jwt.decode(token, process.env.SECRET_KEY);
        userId = decodedToken.user.id;
      }
  
      const { rows: topUsers } = await pool.query(`
        SELECT users.id, users.name, users.profile_image, COUNT(posts.id) AS post_count
        FROM users
        LEFT JOIN posts ON users.id = posts.user_id
        GROUP BY users.id
        ORDER BY post_count DESC
        LIMIT 30
      `);
  
      res.locals.topUsers = topUsers;
  
      for (let post of posts) {
        const { rows: comments } = await pool.query(`
          SELECT comments.id as comment_id, users.id as user_id, users.name, users.profile_image, comments.body, comments.created_at
          FROM comments
          INNER JOIN users ON comments.user_id = users.id WHERE comments.post_id = $1 ORDER BY comment_id `, [post.post_id]);
        post.comments = comments;
  
        const { rows: voteCounts } = await pool.query(`
          SELECT 
            SUM(CASE WHEN vote = 'up' THEN 1 ELSE 0 END) AS up_votes_count,
            SUM(CASE WHEN vote = 'down' THEN 1 ELSE 0 END) AS down_votes_count
          FROM votes
          WHERE post_id = $1;
        `, [post.post_id]);
        post.up_votes_count = voteCounts[0].up_votes_count;
        post.down_votes_count = voteCounts[0].down_votes_count;
  
        if (userId) {
          const { rows: userVote } = await pool.query(`
            SELECT vote
            FROM votes
            WHERE user_id = $1 AND post_id = $2`, [userId, post.post_id]);
          post.userVote = userVote[0] ? userVote[0].vote : null;
        }
      }
      let user2 = null
      if (!userId) {
        
        res.render('post', { user: null, posts, user2 });
      } else {
        User.getUserById(userId, (err, user) => {
          if (err) {
            console.error(err);
            return res.status(500).send("Internal server error");
          }
          user2 = user
          res.render('post', { user, posts , user2});
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  };
  

router.post("/posts", async (req, res) => {
  const { title, body, user_id} = req.body;
  try {
    await pool.query(
      "INSERT INTO posts (title, body, user_id) VALUES ($1, $2, $3);",
      [title, body, user_id]
    );
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

const deletePost = async (req, res) => {
  const postId = req.params.id;
  try {
    await pool.query("DELETE FROM posts WHERE id = $1;", [postId]);
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};
  const updatePost = async (req, res) => {
    const postId = req.params.id;
    const { title, content } = req.body;
  
    try {
      await pool.query(
        "UPDATE posts SET title = $1, content = $2 WHERE id = $3",
        [title, content, postId]
      );
      res.status(200).send("Post updated successfully");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  };
  

  async function deleteComment(req, res) {
    const commentId = req.params.id;
    try {
      await pool.query('DELETE FROM comments WHERE id = $1', [commentId]);
      res.send('Comment deleted successfully');
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal server error');
    }
  }
  
const upvotePost = async (req, res) => {



  try {
    const  postId  = req.params.id;
    const token = req.cookies.jwt;
    const decodedToken = jwt.verify(token, "JWT_SECRETs123");
    if (!decodedToken || !decodedToken.user.id) {
      throw new Error("Invalid token");
    }
    const userId = decodedToken.user.id;
    const post = await pool.query('SELECT * FROM posts WHERE id = $1', [postId]);
    if (!post.rows[0]) {
      return res.status(404).send('Post not found');
    }
    const existingVote = await pool.query('SELECT * FROM votes WHERE user_id = $1 AND post_id = $2', [userId, postId]);
    if (existingVote.rows[0] && existingVote.rows[0].vote === 'up') {
      return res.status(400).send('You have already upvoted this post');
    }
    await pool.query('BEGIN');
    if (existingVote.rows[0] && existingVote.rows[0].vote === 'down') {
      await pool.query('UPDATE votes SET vote = $1 WHERE user_id = $2 AND post_id = $3', ['up', userId, postId]);
    } else {
      await pool.query('INSERT INTO votes (user_id, post_id, vote) VALUES ($1, $2, $3)', [userId, postId, 'up']);
    }
    await pool.query('COMMIT');
    res.send('Post upvoted successfully');
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error(error);
    res.status(500).send('Internal server error');
  }
};

const downvotePost = async (req, res) => {
  
  try {
    const  postId  = req.params.id;
    const token = req.cookies.jwt;
    const decodedToken = jwt.verify(token, "JWT_SECRETs123");
    if (!decodedToken || !decodedToken.user.id) {
      throw new Error("Invalid token");
    }

    const userId = decodedToken.user.id;
    
    const post = await pool.query('SELECT * FROM posts WHERE id = $1', [postId]);
    if (!post.rows[0]) {
      return res.status(404).send('Post not found');
    }
    const existingVote = await pool.query('SELECT * FROM votes WHERE user_id = $1 AND post_id = $2', [userId, postId]);
    if (existingVote.rows[0] && existingVote.rows[0].vote === 'down') {
      return res.status(400).send('You have already downvoted this post');
    }
    await pool.query('BEGIN');
    if (existingVote.rows[0] && existingVote.rows[0].vote === 'up') {
      await pool.query('UPDATE votes SET vote = $1 WHERE user_id = $2 AND post_id = $3', ['down', userId, postId]);
    } else {
      await pool.query('INSERT INTO votes (user_id, post_id, vote) VALUES ($1, $2, $3)', [userId, postId, 'down']);
    }
    await pool.query('COMMIT');
    res.status(200).send('Post downvoted successfully');
  } catch (error) {
    console.error(error);
    await pool.query('ROLLBACK');
    res.status(500).send('Internal server error');
  }
};


  module.exports = {
    getPostById,
    deletePost,
    updatePost,
    createPost,
    createComment,
    deleteComment,
    upvotePost,
    downvotePost,
    getTopUsers,
    getPopularPosts,
  };
  