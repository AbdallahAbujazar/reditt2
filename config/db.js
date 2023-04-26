const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgres://abdallah:n0Ex7epvypYkkxWS003FROqo5fR50H7N@dpg-ch4g5t4s3fvjtici8atg-a/myapp_ovz0'
});

module.exports = pool;
