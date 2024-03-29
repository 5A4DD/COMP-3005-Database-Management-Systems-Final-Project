const { Pool } = require('pg');

const pool = require('../db');

async function setTrainerAvailability(req) {
  const trainerID = 1; // Assuming we're setting availability for trainerID 1
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  for (let day of days) {
    let startTime = req.body[day + '_in'];
    console.log(day);
    console.log(startTime);
    let endTime = req.body[day + '_out'];
    console.log(endTime);
    console.log('-----------')
    const allDay = req.body[day + '_allday'] === 'allday';

    if (allDay) {
      startTime = '00:00:00';
      endTime = '23:59:59';
    }

    const availabilityCheckQuery = `
      SELECT availabilityid FROM Availability 
      WHERE day = $1 AND startTime = $2 AND endTime = $3
    `;

    const existingAvailability = await pool.query(availabilityCheckQuery, [day, startTime, endTime]);

    if (existingAvailability.rowCount === 0) {
      const insertAvailabilityQuery = `
        INSERT INTO Availability (day, startTime, endTime) 
        VALUES ($1, $2, $3) RETURNING availabilityid
      `;

      const insertResult = await pool.query(insertAvailabilityQuery, [day, startTime, endTime]);

      if (insertResult.rows.length === 0) {
        throw new Error(`No availabilityid returned for day ${day}`);
      }

      const newAvailabilityID = insertResult.rows[0].availabilityid;
      console.log(`New Availability ID for day ${day}:`, newAvailabilityID);

      const insertTrainerAvailabilityQuery = `
        INSERT INTO TrainerAvailability (trainerID, availabilityid) 
        VALUES ($1, $2)
      `;

      await pool.query(insertTrainerAvailabilityQuery, [trainerID, newAvailabilityID]);
      console.log(`Trainer availability set for day ${day} with availabilityid: ${newAvailabilityID}`);
    } else {
      const existingAvailabilityID = existingAvailability.rows[0].availabilityid;
      console.log(`Found existing availability for day ${day} with ID: ${existingAvailabilityID}`);
      
      const insertTrainerAvailabilityQuery = `
        INSERT INTO TrainerAvailability (trainerID, availabilityid) 
        VALUES ($1, $2) ON CONFLICT (trainerID, availabilityid) DO NOTHING
      `;
      
      await pool.query(insertTrainerAvailabilityQuery, [trainerID, existingAvailabilityID]);
    }
  }
}

module.exports = { setTrainerAvailability };
