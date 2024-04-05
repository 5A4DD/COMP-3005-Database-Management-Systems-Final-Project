// member_functions.js
document.addEventListener('DOMContentLoaded', function () {
    console.log('Document loaded.');

    // Handle registration form submission
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
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
                password: document.getElementById('password').value,
            };

            fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = '/login.html'; // Redirect to login after registration
                } else {
                    alert('Registration failed: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error during registration:', error);
            });
        });
    }

    // Event listener for the login form submission
    // const loginForm = document.getElementById('loginForm');
    // if (loginForm) {
    //     loginForm.addEventListener('submit', function(e) {
    //         e.preventDefault();

    //         const email = document.getElementById('email').value;
    //         const password = document.getElementById('password').value;

    //         fetch('/api/login', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({ email, password }),
    //         })
    //         .then(response => response.json())
    //         .then(data => {
    //             console.log(data);
    //             if (data.success) {
    //                 console.log(data.fname);
    //                 console.log(data.memberid);
    //                 localStorage.setItem('fname', data.fname);
    //                 localStorage.setItem('memberid', data.memberid);

    //                 window.location.href = '/profile.html';
    //             } else {
    //                 alert('Login failed: ' + data.message);
    //             }
    //         })
    //         .catch(error => {
    //             console.error('Error during login:', error);
    //         });
    //     });
    // }

    // Handle create profile form submission
    const createProfileForm = document.getElementById('createProfileForm');
    if (createProfileForm) {
        createProfileForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const memberId = localStorage.getItem('memberid');
            console.log("IN PROFILE MEMBERID" + memberId);
            const formData = {
                memberId: memberId,
                weight: document.getElementById('weight').value,
                bloodPressure: document.getElementById('bloodPressure').value,
                bodyFat: document.getElementById('bodyFat').value,
            };

            fetch('/api/updateProfile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(data.message);
                } else {
                    alert('Failed to create profile: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error during profile creation:', error);
            });
        });
    }

    //updating member info in profile.html
    const updateForm = document.getElementById('updateUserInfoForm');
    updateForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = {
            email: document.getElementById('updateEmail').value,
            phone: document.getElementById('updatePhone').value,
            homeNum: document.getElementById('updateHomeNum').value,
            streetName: document.getElementById('updateStreetName').value,
            postalCode: document.getElementById('updatePostalCode').value,
        };

        // Assuming you store memberId or a similar identifier in localStorage or another client-side storage
        const memberId = localStorage.getItem('memberid');

        fetch(`/api/updateUserInfo/${memberId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                alert('Member information updated successfully.');
            } else {
                alert('Failed to update profile: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error updating profile:', error);
        });
    });

    const fitnessGoalsForm = document.getElementById('updateFitnessGoalsForm');
    if (fitnessGoalsForm) {
        fitnessGoalsForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const fitnessGoalsData = {
                targetWeight: document.getElementById('targetWeight').value,
                targetPace: document.getElementById('targetPace').value,
                targetBodyFat: document.getElementById('targetBodyFat').value,
            };

            const memberId = localStorage.getItem('memberid'); // Assuming member ID is stored in localStorage

            fetch(`/api/updateFitnessGoals/${memberId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fitnessGoalsData),
            })
            .then(response => response.json())
            .then(data => alert(data.message))
            .catch(error => console.error('Error updating fitness goals:', error));
        });
    }
});
