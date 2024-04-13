const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 3000;


const memberCredentials = {     
    'alicewong@email.com': '2222',
    'bobjohnson@email.com': '3333',
    'Q@Q': '1111',
    'Z@Z': '1234'
};
const trainerCredentials = {
    'johndoe@email.com': '2222',
    'janesmith@email.com': '3333'
};
const adminCredentials = {
    'charlieadmin@email.com': '6969'
};

const pool = require('./db');

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use(express.static('views'));
app.use('/styles', express.static('styles'));

app.use('/functions', express.static('functions'));

app.use('/images', express.static('images'))

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

app.post('/api/register', async (req, res) => {
    try {
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
            ) RETURNING memberID`;  

        const memberValues = [firstName, lastName, gender, email, phone, homeNum, streetName, postalCode, dob];
        const memberResult = await pool.query(insertMemberQuery, memberValues);
        const memberId = memberResult.rows[0].memberid;

        const insertProfileQuery = `
            INSERT INTO Profile (memberID, status, weight, bloodPressure, bodyFat)
            VALUES ($1, 'Active', NULL, NULL, NULL)
            RETURNING profileID;`; 

        const profileResult = await pool.query(insertProfileQuery, [memberId]);
        const profileId = profileResult.rows[0].profileid;
        const updateMemberQuery = `UPDATE Member SET profileID = $1 WHERE memberID = $2;`;
        await pool.query(updateMemberQuery, [profileId, memberId]);

        res.json({ success: true, message: 'Member and profile created successfully.', member: memberResult.rows[0], profile: profileResult.rows[0] });
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (memberCredentials[email] && memberCredentials[email] === password) {
        const query = 'SELECT memberid, fName FROM Member WHERE emailAddr = $1';
        try {
            const dbRes = await pool.query(query, [email]);

            console.log("LOGIN SUCCESSFULL!");

            if (dbRes.rows.length > 0) {
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
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
});

app.post('/api/updateProfile', async (req, res) => {
    const { memberId, weight, bloodPressure, bodyFat } = req.body;

    try {
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

app.post('/api/updateUserInfo/:memberId', async (req, res) => {
    const { memberId } = req.params;
    const { email, phone, homeNum, streetName, postalCode } = req.body;

    try {
        const updateQuery = `
            UPDATE Member
            SET emailAddr = $2, phone = $3, homeNum = $4, streetName = $5, postalCode = $6
            WHERE memberId = $1
            RETURNING *;`;

        
        //memberCredentials[email] = password;
        
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

app.get('/api/memberRoutines/:memberId', async (req, res) => {
    const memberId = parseInt(req.params.memberId);

    try {
        const routinesQuery = `
            SELECT ex.name, ex.description 
            FROM profileroutines pr
            INNER JOIN exercise ex ON pr.exerciseid = ex.exerciseid
            WHERE pr.profileid = $1;
        `;
        const routinesRes = await pool.query(routinesQuery, [memberId]);
        res.json({ success: true, routines: routinesRes.rows });
    } catch (error) {
        console.error('Error fetching member routines:', error);
        res.status(500).json({ success: false, message: 'Internal server error while fetching member routines.' });
    }
});

app.get('/api/memberAchievements/:memberId', async (req, res) => {
    const { memberId } = req.params;

    try {
        const achievementsQuery = `
            SELECT g.goalid, g.targetweight, g.targetpace, g.targetbodyfat
            FROM profileachievements pa
            JOIN achievements a ON pa.achievid = a.achievid
            JOIN goal g ON a.goalid = g.goalid
            JOIN profilegoals pg ON pg.goalid = g.goalid
            WHERE pg.profileid = $1;
        `;
        const achievementsRes = await pool.query(achievementsQuery, [memberId]);
        res.json({ success: true, achievements: achievementsRes.rows });
    } catch (error) {
        console.error('Error fetching member achievements:', error);
        res.status(500).json({ success: false, message: 'Internal server error while fetching member achievements.' });
    }
});

app.get('/api/memberHealthStats/:memberId', async (req, res) => {
    const memberId = parseInt(req.params.memberId);

    try {
        const healthStatsQuery = `
            SELECT weight, bloodpressure, bodyfat
            FROM profile
            WHERE memberid = $1;
        `;
        const healthStatsRes = await pool.query(healthStatsQuery, [memberId]);
        res.json({ success: true, healthStats: healthStatsRes.rows[0] });
    } catch (error) {
        console.error('Error fetching member health stats:', error);
        res.status(500).json({ success: false, message: 'Internal server error while fetching member health stats.' });
    }
});

app.get('/api/get-member-payments/:memberId', async (req, res) => {
    const memberId = parseInt(req.params.memberId);
    try {
        const query = `
            SELECT p.paymentid, p.type, p.dateissued, p.datebilled, p.amount
            FROM Payment p
            JOIN Member m ON m.memberID = p.payee
            WHERE m.memberID = $1;
        `;
        const result = await pool.query(query, [memberId]);
        if (result.rows.length > 0) {
            res.json({ success: true, payments: result.rows });
        } else {
            res.status(404).json({ success: false, message: 'No payments found.' });
        }
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.delete('/api/delete-payment/:paymentId', async (req, res) => {
    const paymentId = parseInt(req.params.paymentId);
    try {
        const deleteQuery = 'DELETE FROM Payment WHERE paymentid = $1';
        const result = await pool.query(deleteQuery, [paymentId]);
        if (result.rowCount > 0) {
            res.json({ success: true, message: 'Payment successful!' });
        } else {
            res.status(404).json({ success: false, message: 'Payment not found.' });
        }
    } catch (error) {
        console.error('Error deleting payment:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.post('/api/updateFitnessGoals/:memberId', async (req, res) => {
    const memberId = parseInt(req.params.memberId);
    const { targetWeight, targetPace, targetBodyFat } = req.body;

    try {
        await pool.query('BEGIN');

        const profileGoalsQuery = `
            SELECT g.goalid
            FROM profilegoals pg
            JOIN goal g ON pg.goalid = g.goalid
            WHERE pg.profileid = $1;
        `;
        const existingGoalsRes = await pool.query(profileGoalsQuery, [memberId]);

        let goalId;
        if (existingGoalsRes.rowCount > 0) {
            goalId = existingGoalsRes.rows[0].goalid;
            const updateGoalQuery = `
                UPDATE goal
                SET targetweight = $2, targetpace = $3, targetbodyfat = $4
                WHERE goalid = $1
                RETURNING *;
            `;
            await pool.query(updateGoalQuery, [goalId, targetWeight, targetPace, targetBodyFat]);
        } else {
            const insertGoalQuery = `
                INSERT INTO goal (targetweight, targetpace, targetbodyfat)
                VALUES ($1, $2, $3)
                RETURNING goalid;
            `;
            const goalRes = await pool.query(insertGoalQuery, [targetWeight, targetPace, targetBodyFat]);
            goalId = goalRes.rows[0].goalid;

            const insertProfileGoalQuery = `
                INSERT INTO profilegoals (profileid, goalid)
                VALUES ($1, $2);
            `;
            await pool.query(insertProfileGoalQuery, [memberId, goalId]);
        }
        await pool.query('COMMIT');
        
        res.json({ success: true, message: 'Fitness goals updated successfully.', goalId: goalId });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error updating fitness goals:', error);
        res.status(500).json({ success: false, message: 'Error updating fitness goals.' });
    }
});

app.post('/submit-maintenance-log', async (req, res) => {
    try {
        const { equipmentID, maintenanceDate, location, score, adminID } = req.body;

        const checkEquipmentQuery = 'SELECT * FROM Equipment WHERE equipmentID = $1';
        const checkEquipmentValues = [equipmentID];
        const equipmentExists = await pool.query(checkEquipmentQuery, checkEquipmentValues);

        if (equipmentExists.rows.length === 0) {
            return res.status(404).send('Equipment not found');
        }

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
    const {bookings, adminId} = req.body;
    const action = req.query.action;
    console.log(adminId);

    try {
        await pool.query('BEGIN');

        for (const { bookingId, memberId, instructorId } of bookings) {
            if (action === 'accept') {

                await pool.query('DELETE FROM requestbooking WHERE bookingid = $1 AND memberid = $2', [bookingId, memberId]);

                const memberScheduleQuery = 'SELECT schedulemid FROM memberschedule WHERE memberid = $1';
                const memberScheduleRes = await pool.query(memberScheduleQuery, [memberId]);
                if (memberScheduleRes.rows.length > 0) {
                    const schedulemid = memberScheduleRes.rows[0].schedulemid;
                    const memberEventsInsertQuery = 'INSERT INTO eventsmember (bookingid, schedulemid) VALUES ($1, $2)';
                    await pool.query(memberEventsInsertQuery, [bookingId, schedulemid]);
                }

                const trainerScheduleQuery = 'SELECT scheduletid FROM trainerschedule WHERE trainerid = $1';
                const trainerScheduleRes = await pool.query(trainerScheduleQuery, [instructorId]);
                if (trainerScheduleRes.rows.length > 0) {
                    const scheduletid = trainerScheduleRes.rows[0].scheduletid;
                    const updateBookingQuery = `
                        UPDATE Booking 
                        SET scheduletid = $1, status = 'Approved', processingadmin = $2 
                        WHERE bookingid = $3
                    `;
                    await pool.query(updateBookingQuery, [scheduletid, adminId, bookingId]);
                }
            } else if (action === 'deny') {
                const updateBookingStatusQuery = `
                    UPDATE Booking 
                    SET status = 'Declined', processingadmin = $1 
                    WHERE bookingid = $2
                `;
                await pool.query(updateBookingStatusQuery, [adminId, bookingId]);
            }
        }

        await pool.query('COMMIT');
        res.json({ success: true, message: `Bookings have been ${action === 'accept' ? 'accepted' : 'denied'}.` });
    } catch (error) {
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
    let trainerAvailable = false;
    let equipmentStatus = false;

    try {
        const startTime = new Date(`${date}T${time}`);
        const endTime = new Date(startTime.getTime() + duration * 60000);

        const dayOfWeek = startTime.toLocaleString('en-US', { weekday: 'long' });

        const trainerAvailabilityQuery = `
            SELECT a.*
            FROM traineravailability ta
            JOIN availability a ON ta.availabilityid = a.availabilityid
            WHERE ta.trainerid = $1 AND a.day = $2;
        `;
        const availabilityRes = await pool.query(trainerAvailabilityQuery, [instructor, dayOfWeek]);
        availabilityRes.rows.forEach(avail => {
            const availStartTime = new Date(`${date}T${avail.starttime}`);
            const availEndTime = new Date(`${date}T${avail.endtime}`);
            if (availStartTime <= startTime && availEndTime >= endTime) {
                trainerAvailable = true;
            }
        });

        const equipmentScoreQuery = `
            SELECT score FROM equipment
            WHERE location = $1;
        `;
        const equipmentRes = await pool.query(equipmentScoreQuery, [room]);
        if (equipmentRes.rows.length > 0) {
            const { score } = equipmentRes.rows[0];
            equipmentStatus = score >= 7;
        }

        const checkBookingQuery = `
            SELECT bookingid FROM booking
            WHERE type = $1 AND date = $2 AND time = $3 AND duration = $4 AND instructor = $5 AND room = $6;
        `;
        const existingBooking = await pool.query(checkBookingQuery, [classType, date, time, duration, instructor, room]);

        let bookingId;
        if (existingBooking.rowCount > 0) {
            bookingId = existingBooking.rows[0].bookingid;
        } else {
            const insertBookingQuery = `
                INSERT INTO booking (type, date, time, duration, instructor, room, status, traineravailable, equipmentstatus)
                VALUES ($1, $2, $3, $4, $5, $6, 'Pending', $7, $8) 
                RETURNING bookingid;
            `;
            const newBooking = await pool.query(insertBookingQuery, [classType, date, time, duration, instructor, room, trainerAvailable, equipmentStatus]);
            bookingId = newBooking.rows[0].bookingid;
        }

        const insertRequestBookingQuery = `
            INSERT INTO requestbooking (bookingid, memberid)
            VALUES ($1, $2)
            ON CONFLICT (bookingid, memberid) DO NOTHING;
        `;
        await pool.query(insertRequestBookingQuery, [bookingId, memberId]);

        res.json({ success: true, message: 'Booking processed successfully.', bookingId: bookingId, trainerAvailable, equipmentStatus });
    } catch (error) {
        console.error('Error processing booking request:', error);
        res.status(500).json({ success: false, message: 'Internal server error while processing booking request.' });
    }
});

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

app.post('/api/cancel-booking', async (req, res) => {
    const { bookingId, memberId } = req.body;

    try {
        await pool.query('BEGIN');

        const scheduleQuery = 'SELECT schedulemid FROM memberschedule WHERE memberid = $1';
        const scheduleResult = await pool.query(scheduleQuery, [memberId]);

        if (scheduleResult.rowCount > 0) {
            const { schedulemid } = scheduleResult.rows[0];

            const deleteQuery = 'DELETE FROM eventsmember WHERE bookingid = $1 AND schedulemid = $2';
            await pool.query(deleteQuery, [bookingId, schedulemid]);

            await pool.query('COMMIT');
            
            res.json({ success: true, message: 'Booking cancelled successfully.' });
        } else {
            throw new Error('No associated schedule found for member.');
        }
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error during booking cancellation:', error);
        res.status(500).json({ success: false, message: 'Failed to cancel booking.' });
    }
});

app.get('/get-equipment', async (req, res) => {
    try {
        const getAllEquipmentQuery = 'SELECT * FROM Equipment';
        
        const equipmentData = await pool.query(getAllEquipmentQuery);

        res.json(equipmentData.rows);
    } catch (err) {
        console.error('Error fetching equipment data:', err);
        res.status(500).send('Internal server error');
    }
});

app.post('/issue-invoice', async (req, res) => {
    try {
        const { type, dateBilled, amount, processingAdmin, payee } = req.body;
        const dateIssued = new Date().toISOString().slice(0, 10);

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
    const trainerID = req.body.trainerId; 

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    try {
        for (let day of days) {
            let startTime = req.body[day + '_in'];
            let endTime = req.body[day + '_out'];
            const allDay = req.body[day + '_allday'];

            if (!startTime && !endTime && !allDay) {
                continue;
            }

            if (allDay) {
                startTime = '00:00:00';
                endTime = '23:59:59';
            }

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
            return res.status(404).json({ message: 'Profile not found.' });
        }
        console.log(profileResult.rows)
        res.json(profileResult.rows);
    } catch (error) {
        console.error('Error in /search-member:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

app.post('/api/trainerLogin', async (req, res) => {
    const { email, password } = req.body;
    if (trainerCredentials[email] && trainerCredentials[email] === password) {
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

app.get('/api/get-trainer-bookings', async (req, res) => {
    const { trainerId } = req.query;  

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

    if (adminCredentials[email] && adminCredentials[email] === password) {
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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/index.html`);
}); 