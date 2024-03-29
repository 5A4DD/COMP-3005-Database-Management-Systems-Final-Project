const { Pool } = require('pg');

// db.js
const pool = new Pool({
    user: 'u67bojptsr66u3',
    host: 'c8lcd8bq1mia7p.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com',
    database: 'd5e6c68ems7k6p',
    password: 'pa2516a11e1396f55ab131cfce83602db44e99cd1889983b3e79cc1bcd9ec9651',
    port: 5432,
    ssl: {
        rejectUnauthorized: false,
    }
});

module.exports = pool;
