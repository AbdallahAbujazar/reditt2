const pool = require('../config/db');

const getTopUsers = async (req, res, next) => {
  try {
    const { rows: topUsers } = await pool.query(`
      SELECT 
        users.id,
        users.name,
        users.profile_image,
        COUNT(posts.user_id) as post_count
      FROM users 
      LEFT JOIN posts ON users.id = posts.user_id 
      GROUP BY users.id 
      ORDER BY post_count DESC 
      LIMIT 30;
    `);
    res.locals.topUsers = topUsers;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

module.exports = { getTopUsers };
