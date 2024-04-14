CREATE TABLE Trainer (
trainerID SERIAL PRIMARY KEY,
fName VARCHAR(255),
lName VARCHAR(255),
gender CHAR(1),
certification VARCHAR(255),
securityCheck BOOLEAN,
emailAddr VARCHAR(255),
phone VARCHAR(255),
scheduleTID INTEGER
);
CREATE TABLE Availability (
availabilityID SERIAL PRIMARY KEY,
day VARCHAR(255),
startTime TIME,
endTime TIME
);
CREATE TABLE TrainerAvailability (
trainerID INTEGER,
availabilityID INTEGER,
PRIMARY KEY (trainerID, availabilityID)
);
CREATE TABLE TrainerSchedule (
scheduleTID SERIAL PRIMARY KEY,
trainerID INTEGER,
updatingAdmin INTEGER
);
CREATE TABLE TrainerView (
profileID INTEGER,
trainerID INTEGER,
PRIMARY KEY (profileID, trainerID)
);
CREATE TABLE TrainerAssigns (
trainerID INTEGER,
profileID INTEGER,
exerciseID INTEGER,
PRIMARY KEY (trainerID, profileID)
);
CREATE TABLE Member (
memberID SERIAL PRIMARY KEY,
profileID INTEGER,
fName VARCHAR(255),
lName VARCHAR(255),
gender CHAR(1),
emailAddr VARCHAR(255),
phone VARCHAR(255),
homeNum VARCHAR(255),
streetName VARCHAR(255),
postalCode VARCHAR(255),
dateOfBirth DATE CHECK (dateOfBirth <= CURRENT_DATE - INTERVAL '18
years')
);
CREATE TABLE MemberSchedule (
scheduleMID SERIAL PRIMARY KEY,
memberID INTEGER,
updatingAdmin INTEGER
);
CREATE TABLE EventsMember (
bookingID INTEGER,
scheduleMID INTEGER,
PRIMARY KEY (bookingID, scheduleMID)
);
CREATE TABLE Booking (
bookingID SERIAL PRIMARY KEY,
room VARCHAR(255),
type VARCHAR(255),
date DATE,
time TIME,
status VARCHAR(255),
instructor INTEGER,
processingAdmin INTEGER,
equipmentStatus BOOLEAN,
roomStatus BOOLEAN,
trainerAvailable BOOLEAN,
scheduleTID INTEGER,
duration SMALLINT
);
CREATE TABLE RequestBooking (
bookingID INTEGER,
memberID INTEGER,
PRIMARY KEY (bookingID, memberID)
);
CREATE TABLE Equipment (
equipmentID SERIAL PRIMARY KEY,
name VARCHAR(255),
location VARCHAR(255),
monitoringAdmin INTEGER,
lastMonitored DATE,
score SMALLINT CHECK (score BETWEEN 1 AND 10)
);
CREATE TABLE Admin (
adminID SERIAL PRIMARY KEY,
fName VARCHAR(255),
lName VARCHAR(255),
emailAddr VARCHAR(255),
phone VARCHAR(255)
);
CREATE TABLE Payment (
paymentID SERIAL PRIMARY KEY,
type VARCHAR(255),
dateIssued DATE,
dateBilled DATE,
amount MONEY,
processingAdmin INTEGER,
payee INTEGER
);
CREATE TABLE Profile (
profileID SERIAL PRIMARY KEY,
memberID INTEGER,
status VARCHAR(255),
weight INTEGER,
bloodPressure VARCHAR(255),
bodyFat INTEGER
);
CREATE TABLE Goal (
goalID SERIAL PRIMARY KEY,
targetWeight INTEGER,
targetPace TIME,
targetBodyFat INTEGER
);
CREATE TABLE Achievements (
achievID SERIAL PRIMARY KEY,
goalID INTEGER
);
CREATE TABLE ProfileAchievements (
profileID INTEGER,
achievID INTEGER,
PRIMARY KEY (profileID, achievID)
);
CREATE TABLE ProfileGoals (
profileID INTEGER,
goalID INTEGER,
PRIMARY KEY (profileID, goalID)
);
CREATE TABLE ProfileRoutines (
profileID INTEGER,
exerciseID INTEGER,
PRIMARY KEY (profileID, exerciseID)
);
CREATE TABLE Exercise(
exerciseID SERIAL PRIMARY KEY,
name VARCHAR(255),
description TEXT
);
-- ALTER TABLE statements remain unchanged.
