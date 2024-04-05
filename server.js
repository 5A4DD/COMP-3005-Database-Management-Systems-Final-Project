//server.js

const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 3000;

// Initialize dictionaries for storing login credentials
// const memberCredentials = {};
const memberCredentials = {     //only this one is dynamic (it can grow as more people register as members)
    'Q@Q': '1111',
};
const trainerCredentials = {
    'johndoe@email.com': '2222',
    'janesmith@email.com': '3333'
};
const adminCredentials = {
    'charlieadmin@email.com': '6969'
};

let profileid = 3;

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

//MEMBER REGISTER
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
        
        const insertMemberQuery = `
            INSERT INTO Member (
                fName, lName, gender, emailAddr, phone, homeNum, streetName, postalCode, dateOfBirth
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9
            ) RETURNING memberID`;  // Use RETURNING * to get the inserted row

        const memberValues = [firstName, lastName, gender, email, phone, homeNum, streetName, postalCode, dob];
        const memberResult = await pool.query(insertMemberQuery, memberValues);
        const memberId = memberResult.rows[0].memberid;

        // Then, create a blank profile for this member
        const insertProfileQuery = `
            INSERT INTO Profile (memberID, status, weight, bloodPressure, bodyFat)
            VALUES ($1, 'Active', NULL, NULL, NULL)
            RETURNING profileID;`; // This assumes you want to set the status to 'Active' by default

        const profileResult = await pool.query(insertProfileQuery, [memberId]);
        const profileId = profileResult.rows[0].profileid;

        // Lastly, update the Member table with the new profileID
        // This step seems unnecessary if the profileID and memberID are meant to be the same, 
        // but let's proceed as per your requirement
        const updateMemberQuery = `UPDATE Member SET profileID = $1 WHERE memberID = $2;`;
        await pool.query(updateMemberQuery, [profileId, memberId]);

        // Send the response with the inserted member
        res.json({ success: true, message: 'Member and profile created successfully.', member: memberResult.rows[0], profile: profileResult.rows[0] });
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//MEMBER LOGIN
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    // Check the credentials against the stored dictionary
    if (memberCredentials[email] && memberCredentials[email] === password) {
        // Query database for user's name
        const query = 'SELECT memberid, fName FROM Member WHERE emailAddr = $1';
        try {
            const dbRes = await pool.query(query, [email]);

            console.log("LOGIN SUCCESSFULL!");

            if (dbRes.rows.length > 0) {
                // Send name in response
                console.log(dbRes.rows[0].fname + " " + dbRes.rows[0].memberid)
                res.json({ success: true, message: 'Login successful.', fname: dbRes.rows[0].fname, memberid: dbRes.rows[0].memberid });
            } else {
                res.status(401).json({ success: false, message: 'User not found.' });
            }
        } catch (err) {
            console.error('Database error:', err);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } else {
        // Incorrect credentials, login fail
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
});

//MEMBER UPDATE PROFILE HEALTH STATS
app.post('/api/updateProfile', async (req, res) => {
    const { memberId, weight, bloodPressure, bodyFat } = req.body;

    try {
        // Profile exists, so update it
        const updateProfileQuery = `
            UPDATE profile
            SET weight = $2, bloodpressure = $3, bodyfat = $4
            WHERE memberid = $1
            RETURNING *;`;
        const updateValues = [memberId, weight, bloodPressure, bodyFat];
        const updateRes = await pool.query(updateProfileQuery, updateValues);
        res.json({ success: true, message: 'Profile updated successfully.', profile: updateRes.rows[0] });
    } catch (error) {
        console.error('Error handling profile:', error);
        res.status(500).json({ success: false, message: 'Error handling profile. Check server logs for more details.' });
    }
});

//MEMBER UPDATE INITIAL REGISTER INFO
app.post('/api/updateUserInfo/:memberId', async (req, res) => {
    const { memberId } = req.params;
    const { email, phone, homeNum, streetName, postalCode } = req.body;

    try {
        const updateQuery = `
            UPDATE Member
            SET emailAddr = $2, phone = $3, homeNum = $4, streetName = $5, postalCode = $6
            WHERE memberId = $1
            RETURNING *;`;

        const updateValues = [memberId, email, phone, homeNum, streetName, postalCode];

        const dbRes = await pool.query(updateQuery, updateValues);

        if(dbRes.rows.length) {
            res.json({ success: true, message: 'User info updated successfully.', user: dbRes.rows[0] });
        } else {
            res.json({ success: false, message: 'Failed to update user info.' });
        }
    } catch (err) {
        console.error('Error updating user info:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
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

app.post('/issue-invoice', async (req, res) => {
    try {
        const { type, dateBilled, amount, processingAdmin, payee } = req.body;
        const dateIssued = new Date().toISOString().slice(0, 10); // Get the current date in YYYY-MM-DD format

        const insertQuery = `
            INSERT INTO Payment (type, dateIssued, dateBilled, amount, processingAdmin, payee)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;
        
        const values = [type, dateIssued, dateBilled, amount, processingAdmin, payee];

        const result = await pool.query(insertQuery, values);

        res.json({ success: true, payment: result.rows[0] });
    } catch (error) {
        console.error('Error issuing invoice:', error);
        res.status(500).json({ success: false, message: 'Error issuing invoice. Check server logs for more details.' });
    }
});

app.get('/get-payments', async (req, res) => {
    try {
        const query = `
            SELECT p.paymentid, p.type, p.dateissued, p.datebilled, p.amount, p.processingadmin, 
                   m.fName || ' ' || m.lName AS payee
            FROM Payment p
            INNER JOIN Profile pf ON p.payee = pf.profileid
            INNER JOIN Member m ON pf.memberID = m.memberID;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).send('Internal server error');
    }
});



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

app.post('/search-member', async (req, res) => {
    const { first_name, last_name } = req.body;

    try {
        // Perform a query to get the profile details by first name and last name
        const profileQuery = `
            SELECT p.profileID, p.weight, p.bloodPressure, p.bodyFat, p.status,
                   m.memberID, m.fName, m.lName, m.gender, m.emailAddr, m.phone, 
                   CONCAT(m.homeNum, ' ', m.streetName) AS address
            FROM Profile p
            LEFT JOIN Member m ON p.profileID = m.memberID
            WHERE m.fName = $1 AND m.lName = $2;
        `;
        const profileResult = await pool.query(profileQuery, [first_name, last_name]);

        if (profileResult.rows.length === 0) {
            // No profile found with the provided first name and last name
            return res.status(404).json({ message: 'Profile not found.' });
        }
        console.log(profileResult.rows)
        // Send the found profile details as JSON
        res.json(profileResult.rows);
    } catch (error) {
        console.error('Error in /search-member:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});




app.post('/api/trainerLogin', async (req, res) => {
    const { email, password } = req.body;
    // Check the credentials against the trainerCredentials
    if (trainerCredentials[email] && trainerCredentials[email] === password) {
        // If credentials match, query the database for trainer details
        const query = 'SELECT trainerid, fname FROM trainer WHERE emailaddr = $1';
        try {
            const dbRes = await pool.query(query, [email]);
            if (dbRes.rows.length > 0) {
                res.json({ success: true, message: 'Login successful.', fname: dbRes.rows[0].fname, trainerid: dbRes.rows[0].trainerid });
            } else {
                res.status(401).json({ success: false, message: 'Trainer not found.' });
            }
        } catch (err) {
            console.error('Database error:', err);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } else {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
});

app.post('/api/adminLogin', async (req, res) => {
    const { email, password } = req.body;

    // Check the credentials against the adminCredentials (implement adminCredentials as per your logic)
    if (adminCredentials[email] && adminCredentials[email] === password) {
        // If credentials match, query the database for admin details
        const query = 'SELECT adminid, fname FROM admin WHERE emailaddr = $1';
        try {
            const dbRes = await pool.query(query, [email]);
            if (dbRes.rows.length > 0) {
                res.json({ success: true, message: 'Login successful.', fname: dbRes.rows[0].fname, adminid: dbRes.rows[0].adminid });
            } else {
                res.status(401).json({ success: false, message: 'Admin not found.' });
            }
        } catch (err) {
            console.error('Database error:', err);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } else {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
});

// app.post('/search-member', async (req, res) => {
//     const { member_id } = req.body; // Assuming profileID is the same as memberID

//     try {
//         // Perform a query to get the profile details by profileID (assumed to be the same as memberID)
//         const profileQuery = `
//             SELECT p.profileID, p.weight, p.bloodPressure, p.bodyFat, p.status,
//                    m.memberID, m.fName, m.lName, m.gender, m.emailAddr, m.phone, 
//                    CONCAT(m.homeNum, ' ', m.streetName) AS address
//             FROM Profile p
//             LEFT JOIN Member m ON p.profileID = m.memberID
//             WHERE p.profileID = $1;
//         `;
//         const profileResult = await pool.query(profileQuery, [member_id]);

//         if (profileResult.rows.length === 0) {
//             // No profile found with the provided ID
//             return res.status(404).json({ message: 'Profile not found.' });
//         }
//         console.log(profileResult.rows[0])
//         console.log(profileResult.rows[0].profileid)
//         // Send the found profile details as JSON
//         res.json(profileResult.rows[0]);
//     } catch (error) {
//         console.error('Error in /search-member:', error);
//         res.status(500).json({ message: 'Internal server error.' });
//     }
// });


// Start the server at the homepage
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/index.html`);
}); 