function fetchAndDisplayRoutines(memberId) {
    fetch(`/api/memberRoutines/${memberId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const routinesElement = document.getElementById('routineSection');
                data.routines.forEach(routine => {
                    const div = document.createElement('div');
                    div.innerHTML = `<strong>${routine.name}</strong>: ${routine.description}`;
                    routinesElement.appendChild(div);
                });
            } else {
                console.error('Failed to fetch routines:', data.message);
            }
        })
        .catch(error => console.error('Error fetching routines:', error));
}

function fetchAndDisplayAchievements(memberId) {
    fetch(`/api/memberAchievements/${memberId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const achievementsElement = document.getElementById('achievementsSection');
                data.achievements.forEach(achievement => {
                    const div = document.createElement('div');
                    div.innerHTML = `Goal ID: ${achievement.goalid}, Target Weight: ${achievement.targetweight}, Target Pace: ${achievement.targetpace}, Target Body Fat: ${achievement.targetbodyfat}`;
                    achievementsElement.appendChild(div);
                });
            } else {
                console.error('Failed to fetch achievements:', data.message);
            }
        })
        .catch(error => console.error('Error fetching achievements:', error));
}

function fetchAndDisplayHealthStats(memberId) {
    fetch(`/api/memberHealthStats/${memberId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.healthStats) {
                const healthStatsElement = document.getElementById('statsSection');
                healthStatsElement.innerHTML += `
                    <div>Weight: ${data.healthStats.weight}</div>
                    <div>Blood Pressure: ${data.healthStats.bloodpressure}</div>
                    <div>Body Fat: ${data.healthStats.bodyfat}</div>
                `;
            } else {
                console.error('Failed to fetch health stats:', data.message);
            }
        })
        .catch(error => console.error('Error fetching health stats:', error));
}

function fetchAndDisplayPayments(memberId) {
    fetch(`/api/get-member-payments/${memberId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const paymentBody = document.getElementById('paymentBody');
                paymentBody.innerHTML = ''; 
                data.payments.forEach(payment => {
                    const row = document.createElement('tr');
                    row.setAttribute('id', `payment-${payment.paymentid}`);
                    row.innerHTML = `
                        <td>${payment.type}</td>
                        <td>${payment.dateissued.split('T')[0]}</td>
                        <td>${payment.datebilled.split('T')[0]}</td>
                        <td>${payment.amount}</td>
                        <td><button onclick="deletePayment(${payment.paymentid})">Pay Now</button></td>
                    `;
                    paymentBody.appendChild(row);
                });
            } else {
                console.error('Failed to fetch payments:', data.message);
            }
        })
        .catch(error => console.error('Error fetching payments:', error));
}

function deletePayment(paymentId) {
    fetch(`/api/delete-payment/${paymentId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Payment successful!');
            const row = document.getElementById(`payment-${paymentId}`);
            if (row) {
                row.remove(); //remove the payment row from the table
            }
        } else {
            alert('Failed to delete payment: ' + data.message);
        }
    })
    .catch(error => console.error('Error deleting payment:', error));
}


document.addEventListener('DOMContentLoaded', function () {
    console.log('Document loaded.');
    const memberId = localStorage.getItem('memberId');

    if (memberId && window.location.pathname.endsWith('/dashboard.html')) {
        fetchAndDisplayRoutines(memberId);
        fetchAndDisplayAchievements(memberId);
        fetchAndDisplayHealthStats(memberId);
        fetchAndDisplayPayments(memberId);
    }

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
                    window.location.href = '/login.html';
                } else {
                    alert('Registration failed: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error during registration:', error);
            });
        });
    }

    const createProfileForm = document.getElementById('createProfileForm');
    if (createProfileForm) {
        createProfileForm.addEventListener('submit', function (e) {
            e.preventDefault();


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

    function fetchAndDisplayBookings() {
        if (!bookingTable) return;

        console.log("IN BOOKING TABLE------------" + memberId);
        fetch('/api/get-member-bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ member_Id: memberId }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(bookings => {
            const bookingTableBody = document.querySelector('#bookingTable tbody');
            bookingTableBody.innerHTML = bookings.map(booking => {
                const formattedDate = new Date(booking.date).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                });
                return `
                    <tr>
                        <td>${booking.type}</td>
                        <td>${formattedDate}</td>
                        <td>${booking.time}</td>
                        <td>${booking.duration}</td>
                        <td>${booking.room}</td>
                        <td>${booking.instructor}</td>
                        <td><button class="cancel-booking-btn" data-booking-id="${booking.bookingid}">Cancel</button></td>
                    </tr>
                `;
            }).join('');
            addCancelButtonsEventListeners();
        })
        .catch(error => {
            console.error('Error fetching member bookings:', error);
        });
    }

    function addCancelButtonsEventListeners() {
        const cancelButtons = document.querySelectorAll('.cancel-booking-btn');
        cancelButtons.forEach(button => {
            button.addEventListener('click', function() {
                console.log('Cancel button clicked');
                const bookingId = this.getAttribute('data-booking-id');
                fetch('/api/cancel-booking', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ bookingId, memberId }),
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Booking cancelled successfully.');
                        fetchAndDisplayBookings(); 
                    } else {
                        alert('Failed to cancel booking: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Error cancelling booking:', error);
                });
            });
        });
    }

    const bookingTable = document.getElementById('bookingTable');
    console.log(bookingTable);

    if (bookingTable) {
        fetchAndDisplayBookings();
    }

    const bookingRequestForm = document.getElementById('bookingRequestForm');
    if (bookingRequestForm) {
        bookingRequestForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            console.log(memberId);
            const bookingData = {
                memberId: memberId,
                classType: document.getElementById('classType').value,
                date: document.getElementById('date').value,
                time: document.getElementById('time').value,
                duration: document.getElementById('duration').value,
                instructor: document.getElementById('instructor').value,
                room: document.getElementById('room').value,
            };

            fetch('/api/request-booking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if(data.success) {
                    alert('Booking request submitted successfully.');
                } else {
                    alert('Failed to submit booking request: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error submitting booking request:', error);
            });
        });
    }

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

        const memberId = localStorage.getItem('memberId');

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

    const updateFitnessGoalsForm = document.getElementById('updateFitnessGoalsForm');
    if (updateFitnessGoalsForm) {
        updateFitnessGoalsForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const memberId = localStorage.getItem('memberId');

            const fitnessGoalsData = {
                targetWeight: document.getElementById('targetWeight').value,
                targetPace: document.getElementById('targetPace').value,
                targetBodyFat: document.getElementById('targetBodyFat').value,
            };

            fetch(`/api/updateFitnessGoals/${memberId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fitnessGoalsData),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Fitness goals updated successfully.');
                } else {
                    alert('Failed to update fitness goals: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error updating fitness goals:', error);
            });
        });
    }
});
