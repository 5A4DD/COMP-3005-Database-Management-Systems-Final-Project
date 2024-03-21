const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'FitnessClub',
    password: 'postgres',
    port: 5432,
});

async function getMembers() {
    try {
        const res = await pool.query('SELECT * FROM Member'); // Example query
        console.log(res.rows);
    } catch (err) {
        console.error(err);
    }
}

getMembers();