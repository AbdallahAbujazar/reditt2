
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const pool = require('../config/db');

exports.index = async function(req, res) {
  try {
    const { rows: posts } = await db.query(`SELECT 
    posts.id as post_id, users.id as user_id, users.name, users.profile_image, posts.title , posts.body, posts.post_image 
    FROM posts 
    INNER JOIN users ON posts.user_id = users.id
    ORDER BY post_id DESC`);

    const token = req.cookies.jwt;
    let userId;

    if (token) {
      const decodedToken = jwt.decode(token, process.env.SECRET_KEY);
      userId = decodedToken.user.id;
    }

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

let user2 = null
if (!userId) {
  res.render('home', { user: null, posts , user2});
} else {
  User.getUserById(userId, (err, user) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Internal server error");
    }
     user2 = user
    res.render('home', { user, posts, user2});
  });
}

  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};
