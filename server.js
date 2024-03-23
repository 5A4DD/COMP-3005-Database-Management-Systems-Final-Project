const { Pool } = require('pg');

const pool = new Pool({
    user: 'ufqbm7pv6j7bi6',
    host: 'c8lcd8bq1mia7p.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com',
    database: 'd82chc2ib2bi2g',
    password: 'p8d5705ddc8edc70639d612f2ac3ed0efe86b049e6da4acec02245ab524f50bf3',
    port: 5432,
    ssl: {
        rejectUnauthorized: false,
    }
});

// const pool = new Pool({          //local
//     user: 'postgres',
//     host: 'localhost',
//     database: 'FitnessClub',
//     password: 'postgres',
//     port: 5432,
// });

async function getMembers() {
    try {
        const res = await pool.query('SELECT * FROM Member'); // Example query
        console.log(res.rows);
    } catch (err) {
        console.error(err);
    }
}

getMembers();