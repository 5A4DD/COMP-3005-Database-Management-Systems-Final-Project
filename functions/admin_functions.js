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

        function fetchEquipmentData() {
        fetch('/get-equipment')
        .then(response => response.json())
        .then(data => {
            const equipmentTableBody = document.querySelector('#equipmentTable tbody');
            equipmentTableBody.innerHTML = ''; // Clear existing table rows

            data.forEach(equipment => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${equipment.equipmentID}</td>
                    <td>${equipment.equipmentName}</td>
                    <td>${equipment.lastMonitored}</td>
                    <td>${equipment.score}</td>
                    <td>${equipment.monitoringAdmin}</td>
                `;
                equipmentTableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching equipment data:', error);
            // Handle errors if needed
        });
    }

    // Initial fetch of equipment data when the page loads
    fetchEquipmentData();

        
    });
});


