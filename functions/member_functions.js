// member_functions.js

document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('registerForm');

    registerForm.addEventListener('submit', function (e) {
        e.preventDefault();
        
        const formData = {
            fName: document.getElementById('name').value,
            emailAddr: document.getElementById('email').value,
            //password: document.getElementById('password').value
        };
        alert("Received name" + formData.fName);


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
  