// member_functions.js

document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('registerForm');

    registerForm.addEventListener('submit', function (e) {
        e.preventDefault();
        
        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            gender: document.getElementById('gender').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            homeNum: document.getElementById('homeNum').value,
            streetName: document.getElementById('streetName').value,
            postalCode: document.getElementById('postalCode').value,
            dob: document.getElementById('dob').value,
            password: document.getElementById('password').value
        };

        fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Handle success - maybe redirect to the login page or a success page
                window.location.href = '/member/login';
            } else {
                // Handle failure - show an error message
                alert('Registration failed: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});
