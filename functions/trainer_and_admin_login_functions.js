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
            localStorage.setItem('memberName', data.fname);
            localStorage.setItem('memberId', data.memberid);
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
            localStorage.setItem('trainerName', data.fname);
            localStorage.setItem('trainerId', data.trainerid);
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
            localStorage.setItem('adminName', data.fname);
            localStorage.setItem('adminId', data.adminid);
            window.location.href = '/booking.html';
        } else {
            alert('Login failed: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error during admin login:', error);
    });
}