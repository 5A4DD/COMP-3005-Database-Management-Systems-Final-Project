document.addEventListener('DOMContentLoaded', () => {
    const logMaintenanceButton = document.getElementById('logMaintenanceButton');
    logMaintenanceButton.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default form submission behavior

        const equipmentID = document.getElementById('equipmentID').value;
        const maintenanceDate = document.getElementById('maintenanceDate').value;
        const score = document.getElementById('score').value;

        // Send a POST request to the server
        fetch('/submit-maintenance-log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ equipmentID, maintenanceDate, location, score, adminID: 1 })
        })
        .then(response => {
            if (response.ok) {
                console.log('Maintenance log added successfully');
                fetchEquipmentData();
                // Optionally, update the UI or perform other actions on success
                // For example, you can fetch and update the maintenance log table here
            } else {
                console.error('Failed to add maintenance log');
                // Handle errors if needed
            }
        })
        .catch(error => {
            console.error('Error adding maintenance log:', error);
            // Handle network errors or other exceptions
        });
    });

    function fetchEquipmentData() {
        fetch('/get-equipment')
        .then(response => response.json())
        .then(data => {
            const equipmentTableBody = document.querySelector('#equipmentTable tbody');
            equipmentTableBody.innerHTML = ''; // Clear existing table rows

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

    // Fetch equipment data when the page loads
    fetchEquipmentData();

});


document.addEventListener('DOMContentLoaded', () => {
    const issueInvoiceButton = document.getElementById('issueInvoiceButton');

    function fetchAndDisplayPayments() {
        fetch('/get-payments')
            .then(response => response.json())
            .then(payments => {
                const tableBody = document.getElementById('cartBody');
                tableBody.innerHTML = ''; // Clear existing rows

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
        event.preventDefault(); // Prevent the form from submitting normally

        // Collect the form data
        const profileID = document.getElementById('profileID').value;
        const dateBilled = document.getElementById('date').value;
        const itemName = document.getElementById('itemName').value;
        const itemPrice = document.getElementById('itemPrice').value;

        // Assume processingAdmin and payee are known or can be retrieved from the session
        const processingAdmin = 1; // Placeholder value
        const payee = profileID; // Assuming payee is the memberID, adjust as necessary

        // Send a POST request to the server
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
                // Optionally, update the UI or perform other actions on success
            } else {
                console.error('Failed to issue invoice');
                // Handle errors if needed
            }
        })
        .catch(error => {
            console.error('Error issuing invoice:', error);
        });
    });
});
