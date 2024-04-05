//trainer_and_admin_login_functions.js

function loginAsMember() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Store the member's name and ID in localStorage
            localStorage.setItem('memberName', data.fname);
            localStorage.setItem('memberId', data.memberid);
            // Redirect to the member's profile view
            window.location.href = '/profile.html';
        } else {
            alert('Login failed: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error during member login:', error);
    });
}

function loginAsTrainer() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('/api/trainerLogin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Store the trainer's name and ID in localStorage
            localStorage.setItem('trainerName', data.fname);
            localStorage.setItem('trainerId', data.trainerid);
            // Redirect to the trainer's schedule view
            window.location.href = '/view-schedule.html';
        } else {
            alert('Login failed: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error during trainer login:', error);
    });
}

function loginAsAdmin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('/api/adminLogin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Store the admin's name and ID in localStorage
            localStorage.setItem('adminName', data.fname);
            localStorage.setItem('adminId', data.adminid);
            // Redirect to the admin's booking view
            window.location.href = '/booking.html';
        } else {
            alert('Login failed: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error during admin login:', error);
    });
}