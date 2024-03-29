//server.js

const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 3000;

// Initialize dictionaries for storing login credentials
// const memberCredentials = {};
const memberCredentials = {
    'test123@gmail.com': '1234'
};
const trainerCredentials = {};
const adminCredentials = {};

// PostgreSQL pool setup
const pool = require('./db');

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));// This is required to parse JSON request bodies

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

app.get('/profile.html', (req, res) => {
    res.sendFile('profile.html', { root: './views/Member' });
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

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    // Check the credentials against the stored dictionary
    if (memberCredentials[email] && memberCredentials[email] === password) {
        // Correct credentials, login success
        res.json({ success: true, message: 'Login successful.' });
    } else {
        // Incorrect credentials, login fail
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
});


// Route to handle equipment maintenance log submission
app.post('/submit-maintenance-log', async (req, res) => {
    try {
        // Extract data from the request body
        const { equipmentID, maintenanceDate, location, score, adminID } = req.body;

        // Check if the equipment with the given ID exists
        const checkEquipmentQuery = 'SELECT * FROM Equipment WHERE equipmentID = $1';
        const checkEquipmentValues = [equipmentID];
        const equipmentExists = await pool.query(checkEquipmentQuery, checkEquipmentValues);

        if (equipmentExists.rows.length === 0) {
            // Equipment with the given ID does not exist
            return res.status(404).send('Equipment not found');
        }

        // Update the last monitored date and score in the Equipment table
        const updateEquipmentQuery = `
            UPDATE Equipment
            SET lastMonitored = $1, score = $2, monitoringAdmin = $3
            WHERE equipmentID = $4
        `;
        const updateEquipmentValues = [maintenanceDate, score, adminID, equipmentID];
        await pool.query(updateEquipmentQuery, updateEquipmentValues);

        res.status(200).send('Maintenance log added successfully');
    } catch (err) {
        console.error('Error adding maintenance log:', err);
        res.status(500).send('Internal server error');
    }
});

// Route to fetch all equipment data
app.get('/get-equipment', async (req, res) => {
    try {
        // Query all equipment data from the database
        const getAllEquipmentQuery = 'SELECT * FROM Equipment';
        
        const equipmentData = await pool.query(getAllEquipmentQuery);

        // Send the equipment data as JSON response
        res.json(equipmentData.rows);
    } catch (err) {
        console.error('Error fetching equipment data:', err);
        res.status(500).send('Internal server error');
    }
});
// Other middleware...

app.post('/submit-availability', async (req, res) => {
    // Assuming you have some way to determine the trainerID, possibly through authentication
    const trainerID = 1; // Placeholder for the actual trainer ID

    // Define days as an array to iterate over
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    try {
        for (let day of days) {
            let startTime = req.body[day + '_in'];
            let endTime = req.body[day + '_out'];
            const allDay = req.body[day + '_allday'];

            // Skip the day if both startTime and endTime are empty and allDay is not checked
            if (!startTime && !endTime && !allDay) {
                continue;
            }

            if (allDay) {
                startTime = '00:00:00';
                endTime = '23:59:59';
            }

            // Capitalize the first letter of the day name
            const capitalizedDay = day.charAt(0).toUpperCase() + day.slice(1);

            const availabilityCheckQuery = `
                SELECT availabilityid FROM Availability 
                WHERE day = $1 AND startTime = $2 AND endTime = $3
            `;

            const existingAvailability = await pool.query(availabilityCheckQuery, [capitalizedDay, startTime, endTime]);

            if (existingAvailability.rowCount === 0) {
                const insertAvailabilityQuery = `
                    INSERT INTO Availability (day, startTime, endTime) 
                    VALUES ($1, $2, $3) RETURNING availabilityid
                `;

                const insertResult = await pool.query(insertAvailabilityQuery, [capitalizedDay, startTime, endTime]);

                if (insertResult.rows.length === 0) {
                    throw new Error(`No availabilityid returned for day ${capitalizedDay}`);
                }

                const newAvailabilityID = insertResult.rows[0].availabilityid;

                const insertTrainerAvailabilityQuery = `
                    INSERT INTO TrainerAvailability (trainerID, availabilityid) 
                    VALUES ($1, $2)
                `;

                await pool.query(insertTrainerAvailabilityQuery, [trainerID, newAvailabilityID]);

            } else {
                const existingAvailabilityID = existingAvailability.rows[0].availabilityid;

                const insertTrainerAvailabilityQuery = `
                    INSERT INTO TrainerAvailability (trainerID, availabilityid) 
                    VALUES ($1, $2) ON CONFLICT (trainerID, availabilityid) DO NOTHING
                `;

                await pool.query(insertTrainerAvailabilityQuery, [trainerID, existingAvailabilityID]);
            }
        }

        res.status(200).json({ success: true, message: 'Availability updated successfully' });
    } catch (error) {
        console.error('Error setting availability:', error);
        res.status(500).json({ success: false, message: 'Error setting availability. Check server logs for more details.' });
    }
});



// Start the server and other code

// module.exports = pool;

// Start the server at the homepage
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/index.html`);
});