//server.js

const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 3000;

// Initialize dictionaries for storing login credentials
const memberCredentials = {};
const trainerCredentials = {};
const adminCredentials = {};

// PostgreSQL pool setup
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
        const {
            firstName,
            lastName,
            gender,
            email,
            phone,
            homeNum,
            streetName,
            postalCode,
            dob,
            password
        } = req.body;

        console.log("IN SERVER: saving into database: " + firstName)

        memberCredentials[email] = password;
        
        const insertQuery = `
            INSERT INTO Member (
                fName, lName, gender, emailAddr, phone, homeNum, streetName, postalCode, dateOfBirth
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9
            ) RETURNING *`;  // Use RETURNING * to get the inserted row

        // Array of values to insert
        const values = [firstName, lastName, gender, email, phone, homeNum, streetName, postalCode, dob];

        // Execute the query with the values array
        const dbRes = await pool.query(insertQuery, values);

        // Send the response with the inserted member
        res.json({ success: true, member: dbRes.rows[0] });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Start the server at the homepage
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/index.html`);
});