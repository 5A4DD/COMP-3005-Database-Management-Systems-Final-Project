//trainer_and_admin_login_functions.js

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