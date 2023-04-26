const User = require('../models/User');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

exports.profile = async function(req, res) {

  const token = req.cookies.jwt;
  if (!token) {
    const { rows: posts } = await pool.query(`SELECT 
    posts.id as post_id, users.id as user_id, users.name, users.profile_image, posts.title , posts.body , posts.post_image
    FROM posts 
    INNER JOIN users ON posts.user_id = users.id
    ORDER BY post_id DESC`);
    let user2= null
    res.render('home', { user: null ,posts, user2 });
  } else {

    const decodedToken = jwt.decode(token, "JWT_SECRETs123");
    const user = decodedToken.user;
    const userId = user.id

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
    WHERE posts.user_id = $1
    ORDER BY post_id DESC`, [userId]);
  
    
  
  
  for (let post of posts) {
    const { rows: comments } = await pool.query(`
      SELECT comments.id as comment_id, users.id as user_id, users.name, users.profile_image, comments.body, comments.created_at
      FROM comments
      INNER JOIN users ON comments.user_id = users.id WHERE comments.post_id = $1 ORDER BY comment_id`, [post.post_id]);
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
  
  let user2;
      if (!userId) {
        user2= null 
        res.render('profile/', { user: null, posts, user2 });
      } else {
        const { rows: userLoged } = await pool.query(`SELECT * FROM users WHERE id = $1`, [userId]);
        user2 = userLoged[0]
  

        User.getUserById(userId, (err, user) => {
          if (err) {
            console.error(err);
            return res.status(500).send("Internal server error");
          }
          res.render('profile', { user, posts, user2});
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }


  }
};


  exports.profileById = async function(req, res) {
    
    const userId = req.params.id;

    try {
      const { rows: posts } = await pool.query(`
    SELECT 
        posts.id as post_id, 
        users.id as user_id, 
        users.name, 
        users.profile_image, 
        posts.title, 
        posts.user_id, 
        posts.body, posts.post_image 
    FROM posts 
    INNER JOIN users ON posts.user_id = users.id 
    WHERE posts.user_id = $1
    ORDER BY post_id DESC`, [userId]);
  
    
  
  
  for (let post of posts) {
    const { rows: comments } = await pool.query(`
      SELECT comments.id as comment_id, users.id as user_id, users.name, users.profile_image, comments.body, comments.created_at
      FROM comments
      INNER JOIN users ON comments.user_id = users.id WHERE comments.post_id = $1 ORDER BY comment_id`, [post.post_id]);
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
  
  
  if (!userId) {
    const token = req.cookies.jwt;
    let user2 = null;
    if (token) {
      const decodedToken = jwt.decode(token, "JWT_SECRETs123");
      user3 = decodedToken.user.id;
      const { rows: userLoged } = await pool.query(`SELECT * FROM users WHERE id = $1`, [user3]);
      user2 = userLoged[0]
    }
  
    res.render('profile/', { user: null, posts , user2 });
  }
   else {
    const token = req.cookies.jwt;
          let user2 = null;
          if (token) {
            const decodedToken = jwt.decode(token, "JWT_SECRETs123");
            user3 = decodedToken.user.id;
            const { rows: userLoged } = await pool.query(`SELECT * FROM users WHERE id = $1`, [user3]);
            user2 = userLoged[0]
          }

        User.getUserById(userId, (err, user) => {
          if (err) {
            console.error(err);
            return res.status(500).send("Internal server error");
          }
          
          res.render('profile', { user, posts, user2});
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  };


exports.getProfile = function(req, res) {
  const user = res.locals.user;
  res.render('profile', { title: 'Profile', user: user });
};
