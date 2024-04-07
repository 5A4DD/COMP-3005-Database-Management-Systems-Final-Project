//server.js

const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 3000;

// Initialize dictionaries for storing login credentials
// const memberCredentials = {};
const memberCredentials = {     //only this one is dynamic (it can grow as more people register as members)
    'Q@Q': '1111',
    'alicewong@email.com': '2222',
    'bobjohnson@email.com': '3333'
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

app.get('/dashboard.html', (req, res) => {
    res.sendFile('dashboard.html', { root: './views/Member' });
});

app.get('/member-schedule.html', (req, res) => {
    res.sendFile('member-schedule.html', { root: './views/Member' });
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

app.get('/api/get-bookings-events', async (req, res) => {
    try {
        const query = `
        SELECT *
        FROM Booking b
        INNER JOIN requestbooking rb ON b.bookingid = rb.bookingid
        WHERE status = 'Pending';;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching booking and events data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/api/handle-bookings', async (req, res) => {
    const { bookings } = req.body; // This contains an array of { bookingId, memberId }
    const action = req.query.action; // 'accept' or 'deny'

    try {
        // Start a transaction
        await pool.query('BEGIN');

        for (const { bookingId, memberId } of bookings) {
            // Delete the requestbooking entry
            await pool.query('DELETE FROM requestbooking WHERE bookingid = $1 AND memberid = $2', [bookingId, memberId]);

            if (action === 'accept') {
                // Get schedulemid from memberschedule that maps to memberid
                const scheduleQuery = 'SELECT schedulemid FROM memberschedule WHERE memberid = $1';
                const scheduleRes = await pool.query(scheduleQuery, [memberId]);
                const schedulemid = scheduleRes.rows[0].schedulemid;

                // Add the new entry of bookingid to schedulemid into eventsmember
                const eventsMemberInsertQuery = 'INSERT INTO eventsmember (bookingid, schedulemid) VALUES ($1, $2)';
                await pool.query(eventsMemberInsertQuery, [bookingId, schedulemid]);
            }
        }

        // Commit the transaction
        await pool.query('COMMIT');

        res.json({ success: true, message: `Bookings have been ${action === 'accept' ? 'accepted' : 'denied'}.` });
    } catch (error) {
        // Rollback in case of an error
        await pool.query('ROLLBACK');
        console.error(`Error handling bookings: ${error}`);
        res.status(500).json({ success: false, message: 'Internal server error while processing bookings.' });
    }
});


app.post('/api/get-member-bookings', async (req, res) => {
    const { member_Id } = req.body;
    console.log(req.body)
    console.log('In member get bookings');
    try {
        const bookingsQuery = `
            SELECT b.*
            FROM booking b
            INNER JOIN eventsmember em ON b.bookingid = em.bookingid
            INNER JOIN memberschedule ms ON em.schedulemid = ms.schedulemid
            WHERE ms.memberid = $1;
        `;
        const bookings = await pool.query(bookingsQuery, [member_Id]);
        console.log(bookings)
        res.json(bookings.rows);
    } catch (error) {
        console.error('Error fetching member bookings:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/api/request-booking', async (req, res) => {
    const { memberId, classType, date, time, duration, instructor, room } = req.body;

    try {
        // Check if the booking already exists
        const checkBookingQuery = `
            SELECT bookingid FROM booking
            WHERE type = $1 AND date = $2 AND time = $3 AND duration = $4 AND instructor = $5 AND room = $6 AND status = 'Pending';
        `;
        const existingBooking = await pool.query(checkBookingQuery, [classType, date, time, duration, instructor, room]);

        let bookingId;
        if (existingBooking.rowCount > 0) {
            // Booking exists, get the booking id
            bookingId = existingBooking.rows[0].bookingid;
        } else {
            // Booking does not exist, create a new one
            const insertBookingQuery = `
                INSERT INTO booking (type, date, time, duration, instructor, room, status)
                VALUES ($1, $2, $3, $4, $5, $6, 'Pending') 
                RETURNING bookingid;
            `;
            const newBooking = await pool.query(insertBookingQuery, [classType, date, time, duration, instructor, room]);
            bookingId = newBooking.rows[0].bookingid;
        }
        console.log(memberId)
        // Now, link the booking to the member in requestbooking entity
        const insertRequestBookingQuery = `
            INSERT INTO requestbooking (bookingid, memberid)
            VALUES ($1, $2)
            ON CONFLICT (bookingid, memberid) DO NOTHING;
        `;
        await pool.query(insertRequestBookingQuery, [bookingId, memberId]);

        res.json({ success: true, message: 'Booking processed successfully.', bookingId: bookingId });
    } catch (error) {
        console.error('Error processing booking request:', error);
        res.status(500).json({ success: false, message: 'Internal server error while processing booking request.' });
    }
});


// app.post('/api/request-booking', async (req, res) => {
//     // Destructure the body to get the required fields
//     let { classType, date, time, duration, instructor, room } = req.body;

//     try {
//         // Ensure the date is in the format YYYY-MM-DD for PostgreSQL
//         date = new Date(date).toISOString().split('T')[0]; // Converts the date to YYYY-MM-DD format
        
//         // Ensure the time is in the format HH:MM:SS for PostgreSQL
//         time = time + ':00'; // Appends seconds to the time
        
//         // Construct the SQL query to insert the new booking
//         const insertBookingQuery = `
//             INSERT INTO booking (type, date, time, duration, instructor, room, status)
//             VALUES ($1, $2, $3, $4, $5, $6, 'Pending') 
//             RETURNING bookingid; 
//         `;

//         // Execute the query with the formatted date and time
//         const result = await pool.query(insertBookingQuery, [classType, date, time, duration, instructor, room]);

//         // If the insert was successful, send back a success response
//         if (result.rows.length > 0) {
//             res.json({ success: true, message: 'Booking request submitted successfully.', bookingId: result.rows[0].bookingid });
//         } else {
//             // If no rows were inserted, send an error response
//             res.status(400).json({ success: false, message: 'Booking request could not be processed.' });
//         }
//     } catch (error) {
//         // Log the error and send a 500 Internal Server Error response
//         console.error('Error submitting booking request:', error);
//         res.status(500).json({ success: false, message: 'Internal server error while processing booking request.' });
//     }
// });






app.get('/api/get-bookings-events', async (req, res) => {
    try {
        const query = `
            SELECT b.*, ms.memberid
            FROM Booking b
            INNER JOIN eventsmember em ON b.bookingid = em.bookingid
            INNER JOIN memberschedule ms ON em.schedulemid = ms.schedulemid
            WHERE status = 'Pending';
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching booking and events data:', error);
        res.status(500).json({ message: 'Internal server error' });
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
    const trainerID = req.body.trainerId; // Placeholder for the actual trainer ID

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
    const { first_name, last_name, trainer_id} = req.body;

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


// Trainer Get booking
// Endpoint to get bookings by trainerId
app.get('/api/get-trainer-bookings', async (req, res) => {
    const { trainerId } = req.query;  // Assuming trainerId is passed as a query parameter

    try {
        const query = `
            SELECT type, date, time, duration, room, instructor FROM Booking
            WHERE instructor = $1;
        `;
        const result = await pool.query(query, [trainerId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching trainer bookings:', error);
        res.status(500).json({ message: 'Internal server error' });
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

// Start the server at the homepage
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/index.html`);
}); 