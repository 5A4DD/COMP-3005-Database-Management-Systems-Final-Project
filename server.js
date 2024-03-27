// const { Pool } = require('pg');

// const pool = new Pool({
//     user: 'ufqbm7pv6j7bi6',
//     host: 'c8lcd8bq1mia7p.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com',
//     database: 'd82chc2ib2bi2g',
//     password: 'p8d5705ddc8edc70639d612f2ac3ed0efe86b049e6da4acec02245ab524f50bf3',
//     port: 5432,
//     ssl: {
//         rejectUnauthorized: false,
//     }
// });

// // const pool = new Pool({          //local
// //     user: 'postgres',
// //     host: 'localhost',
// //     database: 'FitnessClub',
// //     password: 'postgres',
// //     port: 5432,
// // });

// async function getMembers() {
//     try {
//         const res = await pool.query('SELECT * FROM Member'); // Example query
//         console.log(res.rows);
//     } catch (err) {
//         console.error(err);
//     }
// }

// getMembers();



const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 3000;

// PostgreSQL pool setup
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

app.use(express.json()); // This is required to parse JSON request bodies

// Serve static files from 'views' folder
app.use(express.static('views'));
app.use('/styles', express.static('styles'));

// Serve the 'functions' directory
app.use('/functions', express.static('functions'));

// Redirect root to Member's index.html
app.get('/index.html', (req, res) => {
    res.sendFile('index.html', { root: './views/Member' });
});

app.get('/billings.html', (req, res) => {
    res.sendFile('billings.html', { root: './views/Admin' });
});

app.get('/booking.html', (req, res) => {
    res.sendFile('booking.html', { root: './views/Admin' });
});

app.get('/equipment-maintenance.html', (req, res) => {
    res.sendFile('equipment-maintenance.html', { root: './views/Admin' });
});

app.get('/about.html', (req, res) => {
    res.sendFile('about.html', { root: './views/Member' });
});

app.get('/contact.html', (req, res) => {
    res.sendFile('contact.html', { root: './views/Member' });
});

app.get('/login.html', (req, res) => {
    res.sendFile('login.html', { root: './views/Member' });
});

app.get('/register.html', (req, res) => {
    res.sendFile('register.html', { root: './views/Member' });
});

app.get('/set-availability.html', (req, res) => {
    res.sendFile('set-availability.html', { root: './views/Trainer' });
});

app.get('/view-member.html', (req, res) => {
    res.sendFile('view-member.html', { root: './views/Trainer' });
});

app.get('/view-schedule.html', (req, res) => {
    res.sendFile('view-schedule.html', { root: './views/Trainer' });
});

app.post('/api/register', async (req, res) => {
    try {
        // Extract data from the request body
        const { fName, emailAddr } = req.body;
        console.log(fName)
        // Construct the query with placeholders for parameters
        // Note: Assuming memberID is a SERIAL/AUTO INCREMENT, it should not be included in the insert statement
        const insertQuery = `
            INSERT INTO Member (
                memberID, fName, lName, gender, emailAddr, phone, homeNum, streetName, postalCode, dateOfBirth
            ) VALUES (
                4, $1, 'Doe', 'M', $2, '444-555-6666', '5678', 'Oak Ave', '67890', '1985-09-15'
            ) RETURNING *`;  // Use RETURNING * to get the inserted row

        // Array of values to insert
        const values = [fName, emailAddr];

        // Execute the query with the values array
        const dbRes = await pool.query(insertQuery, values);

        // Send the response with the inserted member
        res.json({ success: true, member: dbRes.rows[0] });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


// API endpoint to get members
app.get('/api/members', async (req, res) => {
    try {
        const dbRes = await pool.query('SELECT * FROM Member');
        res.json(dbRes.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/index.html`);
});