const pool = require('../config/db');

async function getAllPosts() {
  const query = 'SELECT * FROM posts order by id DESC;';
  const { rows } = await pool.query(query);
  return rows.map(row => ({ id: row.id, title: row.title, body: row.body, user_id: row.user_id }));
}

async function getPostById(id) {
  const query = 'SELECT * FROM posts WHERE id = $1;';
  const { rows } = await pool.query(query, [id]);
  if (rows.length === 0) {
    return null;
  }
  const row = rows[0];
  return { id: row.id, title: row.title, body: row.body, user_id: row.user_id };
}

async function createPost(title, body, user_id) {
  const query = 'INSERT INTO posts (title, body, user_id) VALUES ($1, $2, $3) RETURNING *;';
  const values = [title, body, user_id];
  const { rows } = await pool.query(query, values);
  const row = rows[0];
  return { id: row.id, title: row.title, body: row.body, user_id: row.user_id };
}

async function deletePostById(id) {
  const query = 'DELETE FROM posts WHERE id = $1 RETURNING *;';
  const { rows } = await pool.query(query, [id]);
  if (rows.length === 0) {
    return null;
  }
  const row = rows[0];
  return { id: row.id, title: row.title, body: row.body, user_id: row.user_id };
}

async function updatePostById(id, title, body) {
  const query = 'UPDATE posts SET title = $1, body = $2 WHERE id = $3 RETURNING *;';
  const values = [title, body, id];
  const { rows } = await pool.query(query, values);
  if (rows.length === 0) {
    return null;
  }
  const row = rows[0];
  return { id: row.id, title: row.title, body: row.body, user_id: row.user_id };
}



module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  deletePostById,
  updatePostById,
};
