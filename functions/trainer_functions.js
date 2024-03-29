document.addEventListener('DOMContentLoaded', function () {
  const availabilityForm = document.getElementById('availabilityForm');
  if (availabilityForm) {
      availabilityForm.addEventListener('submit', function (e) {
          e.preventDefault();

          const formData = {};
          const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

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
              // If the error has the 'data' property, it came from the server response.
              // You can access the server provided error message like this:
              alert('Failed to update availability: ' + (error.data ? error.data.message : 'Unknown error'));
          });
      });
  }
});
