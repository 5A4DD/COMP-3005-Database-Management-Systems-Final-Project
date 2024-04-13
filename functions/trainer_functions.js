
document.addEventListener('DOMContentLoaded', function () {
    const availabilityForm = document.getElementById('availabilityForm');
    const searchForm = document.querySelector('form[action="/search-member"]');

    if (availabilityForm) {
        availabilityForm.addEventListener('submit', function (e) {
            e.preventDefault();
            
            const formData = {};
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            const trainerid = localStorage.getItem('trainerId');
            formData['trainerId'] = trainerid;
            days.forEach(day => {
                formData[day + '_in'] = document.querySelector(`input[name="${day}_in"]`).value;
                formData[day + '_out'] = document.querySelector(`input[name="${day}_out"]`).value;
                // Check the checkbox state and assign 'allday' if checked
                formData[day + '_allday'] = document.querySelector(`input[name="${day}_allday"]`).checked ? 'allday' : '';
            });

            fetch('/submit-availability', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            .then(response => {
                if (!response.ok) {
                    // If the HTTP response status is not in the 200-299 range
                    // we still try to parse the JSON to get the error message
                    // and then reject the promise with a custom error object.
                    return response.json().then(errorData => {
                        const error = new Error('Error while submitting availability');
                        error.data = errorData;
                        throw error;
                    });
                }
                return response.json();
            })
            .then(data => {
                alert('Availability updated successfully!');
                // Additional actions upon success, such as redirecting to another page
                // window.location.href = '/some-success-page.html';
            })
            .catch(error => {
                console.error('Error during setting availability:', error);
            
                alert('Failed to update availability: ' + (error.data ? error.data.message : 'Unknown error'));
            });
        });
    }
    if (searchForm) {
        searchForm.addEventListener('submit', function (e) {
            e.preventDefault();
    
            // Get the first name and last name values from the form
            const firstNameInput = document.querySelector('input[name="first_name"]');
            const lastNameInput = document.querySelector('input[name="last_name"]');
            const firstName = firstNameInput ? firstNameInput.value : '';
            const lastName = lastNameInput ? lastNameInput.value : '';
    
            // Send the first name and last name to the server to retrieve member details
            fetch('/search-member', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ first_name: firstName, last_name: lastName })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok.');
                }
                return response.json();
            })
            .then(data => {
                // Select the container where member details will be inserted
                const memberDetailsContainer = document.querySelector('.member-details');
                
                // Clear previous member details
                memberDetailsContainer.innerHTML = '';
    
                // Loop over each member data and create a table
                data.forEach(member => {
                    const table = document.createElement('table');
                    table.innerHTML = `
                        <tr><th>Member ID</th><td>${member.profileid || ''}</td></tr>
                        <tr><th>First Name</th><td>${member.fname || ''}</td></tr>
                        <tr><th>Last Name</th><td>${member.lname || ''}</td></tr>
                        <tr><th>Gender</th><td>${member.gender || ''}</td></tr>
                        <tr><th>Email Address</th><td>${member.emailaddr || ''}</td></tr>
                        <tr><th>Phone Number</th><td>${member.phone || ''}</td></tr>
                        <tr><th>Address</th><td>${member.address || ''}</td></tr>
                        <tr><th>Weight</th><td>${member.weight ? member.weight + ' kg' : ''}</td></tr>
                        <tr><th>Blood Pressure</th><td>${member.bloodpressure ? member.bloodpressure + ' mmHg' : ''}</td></tr>
                        <tr><th>Body Fat Percentage</th><td>${member.bodyfat ? member.bodyfat + '%' : ''}</td></tr>
                        <tr><th>Status</th><td>${member.status || ''}</td></tr><br><br>
                    `;
                    // Append the table to the container
                    memberDetailsContainer.appendChild(table);
                });
            })
            .catch(error => {
                console.error('Error during search:', error);
                alert('Failed to retrieve member details. Please try again.');
            });
        });
    }
    function fetchAndDisplayBookings() {
        const trainerId = localStorage.getItem('trainerId');

        fetch(`/api/get-trainer-bookings?trainerId=${trainerId}`)
            .then(response => response.json())
            .then(bookings => {
                const tableBody = document.getElementById('bookingTable').querySelector('tbody');
                tableBody.innerHTML = '';

                bookings.forEach((booking) => {
                    const date = booking.date.split('T')[0];
                    
                    const row = document.createElement('tr');
                    
                    row.innerHTML = `
                        <td>${booking.type}</td>
                        <td>${date}</td>
                        <td>${booking.time}</td>
                        <td>${booking.duration}</td>
                        <td>${booking.room}</td>
                        <td>${booking.instructor}</td>
                    `;
                    tableBody.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Error fetching booking data:', error);
            });
    }

    fetchAndDisplayBookings();
});
    
//     if (searchForm) {
//       searchForm.addEventListener('submit', function (e) {
//           e.preventDefault();

//           // Get the member ID value from the form
//           const memberIDInput = document.querySelector('input[name="member_id"]');
//           const memberID = memberIDInput ? memberIDInput.value : '';

//           // Send the member ID to the server to retrieve member details
//           fetch('/search-member', {
//               method: 'POST',
//               headers: {
//                   'Content-Type': 'application/json'
//               },
//               body: JSON.stringify({ member_id: memberID })
//           })
//           .then(response => {
//               if (!response.ok) {
//                   throw new Error('Network response was not ok.');
//               }
//               return response.json();
//           })
//           .then(data => {
//               // Populate the member details in the HTML
//               const memberDetailsContainer = document.querySelector('.member-details table');
//               if (memberDetailsContainer) {
//                   console.log(data);
//                   memberDetailsContainer.innerHTML = `
//                   <tr><th>Member ID</th><td>${data.profileid || ''}</td></tr>
//                   <tr><th>First Name</th><td>${data.fname || ''}</td></tr>
//                   <tr><th>Last Name</th><td>${data.lname || ''}</td></tr>
//                   <tr><th>Gender</th><td>${data.gender || ''}</td></tr>
//                   <tr><th>Email Address</th><td>${data.emailaddr || ''}</td></tr>
//                   <tr><th>Phone Number</th><td>${data.phone || ''}</td></tr>
//                   <tr><th>Address</th><td>${data.address || ''}</td></tr>
//                   <tr><th>Weight</th><td>${data.weight ? data.weight + ' kg' : ''}</td></tr>
//                   <tr><th>Blood Pressure</th><td>${data.bloodpressure ? data.bloodpressure + ' mmHg' : ''}</td></tr>
//                   <tr><th>Body Fat Percentage</th><td>${data.bodyfat ? data.bodyfat + '%' : ''}</td></tr>
//                   <tr><th>Status</th><td>${data.status || ''}</td></tr>

//                   `;
//               }
//           })
//           .catch(error => {
//               console.error('Error during search:', error);
//               alert('Failed to retrieve member details. Please try again.');
//           });
//       });
//   }
