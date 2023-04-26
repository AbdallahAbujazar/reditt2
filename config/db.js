const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgres://postgres:root@localhost:5432/myapp'
});

module.exports = pool;
