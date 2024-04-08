document.addEventListener('DOMContentLoaded', () => {
    const logMaintenanceButton = document.getElementById('logMaintenanceButton');
    logMaintenanceButton.addEventListener('click', (event) => {
        event.preventDefault(); 

        const adminId = localStorage.getItem('adminId');
        const equipmentID = document.getElementById('equipmentID').value;
        const maintenanceDate = document.getElementById('maintenanceDate').value;
        const score = document.getElementById('score').value;

        fetch('/submit-maintenance-log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ equipmentID, maintenanceDate, location, score, adminID: adminId })
        })
        .then(response => {
            if (response.ok) {
                console.log('Maintenance log added successfully');
                fetchEquipmentData();
            } else {
                console.error('Failed to add maintenance log');
            }
        })
        .catch(error => {
            console.error('Error adding maintenance log:', error);
        });
    });

    function fetchEquipmentData() {
        fetch('/get-equipment')
        .then(response => response.json())
        .then(data => {
            const equipmentTableBody = document.querySelector('#equipmentTable tbody');
            equipmentTableBody.innerHTML = ''; 

            data.forEach(equipment => {
                const dateOfLastMonitored = equipment.lastmonitored.split('T')[0];

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${equipment.equipmentid}</td>
                    <td>${equipment.name}</td>
                    <td>${equipment.location}</td>
                    <td>${equipment.monitoringadmin}</td>
                    <td>${dateOfLastMonitored}</td>
                    <td>${equipment.score}</td>
                `;
                equipmentTableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching equipment data:', error);
        });
    }

    fetchEquipmentData();
});


document.addEventListener('DOMContentLoaded', () => {
    const issueInvoiceButton = document.getElementById('issueInvoiceButton');

    function fetchAndDisplayPayments() {
        fetch('/get-payments')
            .then(response => response.json())
            .then(payments => {
                const tableBody = document.getElementById('cartBody');
                tableBody.innerHTML = '';

                payments.forEach((payment) => {
                    const dateOfDateIssed = payment.dateissued.split('T')[0];
                    const dateofDateBilled = payment.datebilled.split('T')[0];

                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${payment.paymentid}</td>
                        <td>${payment.type}</td>
                        <td>${dateOfDateIssed}</td>
                        <td>${dateofDateBilled}</td>
                        <td>${payment.amount}</td>
                        <td>${payment.processingadmin}</td>
                        <td>${payment.payee}</td>
                    `;
                    tableBody.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Error fetching payment data:', error);
            });
    }

    fetchAndDisplayPayments();

    issueInvoiceButton.addEventListener('click', (event) => {
        event.preventDefault(); 

        const profileID = document.getElementById('profileID').value;
        const dateBilled = document.getElementById('date').value;
        const itemName = document.getElementById('itemName').value;
        const itemPrice = document.getElementById('itemPrice').value;
        const adminId = localStorage.getItem('adminId');

        const processingAdmin = adminId; 
        const payee = profileID; 

        fetch('/issue-invoice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: itemName,
                dateBilled,
                amount: itemPrice,
                processingAdmin,
                payee
            })
        })
        .then(response => {
            if (response.ok) {
                console.log('Invoice issued successfully');
                fetchAndDisplayPayments();
            } else {
                console.error('Failed to issue invoice');
            }
        })
        .catch(error => {
            console.error('Error issuing invoice:', error);
        });
    });
});

function fetchAndDisplayBookings() {
    fetch('/api/get-bookings-events')
        .then(response => response.json())
        .then(bookings => {
            const tableBody = document.getElementById('bookingTable').querySelector('tbody');
            tableBody.innerHTML = '';

            bookings.forEach((booking) => {
                const date = booking.date.split('T')[0];
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><input type="checkbox" class="booking-checkbox" name="selectedBooking" value="${booking.bookingid}" data-member-id="${booking.memberid}" data-instructor-id="${booking.instructor}"></td>
                    <td>${booking.type}</td>
                    <td>${date}</td>
                    <td>${booking.time}</td>
                    <td>${booking.duration}</td>
                    <td>${booking.room}</td>
                    <td>${booking.instructor}</td>
                    <td>${booking.memberid}</td>
                    <td>${booking.traineravailable}</td>
                    <td>${booking.equipmentstatus}</td>
                `;
                tableBody.appendChild(row);
            });
            document.querySelectorAll('.booking-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    if (this.checked) {
                        console.log('Selected Member ID:', this.getAttribute('data-member-id'));
                    }
                });
            });
        })
        .catch(error => {
            console.error('Error fetching booking data:', error);
        });
}

document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayBookings();  
});

document.getElementById('accept-button').addEventListener('click', function() {
    handleSelection('accept');
});

document.getElementById('deny-button').addEventListener('click', function() {
    handleSelection('deny');
});

function handleSelection(action) {
    const adminId = localStorage.getItem('adminId');
    console.log(adminId)
    const selectedBookings = Array.from(document.querySelectorAll('.booking-checkbox:checked')).map(checkbox => {
        const row = checkbox.closest('tr')
        return {
            bookingId: checkbox.value,
            memberId: checkbox.getAttribute('data-member-id'),
            instructorId: checkbox.getAttribute('data-instructor-id')
        };
    });
    console.log(selectedBookings);
    if (selectedBookings.length > 0) {
        fetch(`/api/handle-bookings?action=${action}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ bookings: selectedBookings, adminId: adminId}),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(`Bookings have been successfully ${action === 'accept' ? 'accepted' : 'denied'}.`);
                fetchAndDisplayBookings();
            } else {
                alert(`Failed to ${action} bookings: ` + data.message);
            }
        })
        .catch(error => {
            console.error(`Error while trying to ${action} bookings:`, error);
        });
    } else {
        alert('Please select at least one booking to accept or deny.');
    }
}


