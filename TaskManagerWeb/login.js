document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.querySelector('form');

    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        fetch('https://localhost:7168/Login/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ Name: username, Email: email, Password: password }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(data);

            if (data.success) {
                // Redirige a la URL proporcionada por el servidor
                window.location.href = data.redirectUrl;
            } else {
                if (data.errors) {
                    const errorMessage = Object.values(data.errors).flat().join('\n');
                    alert(`Validation errors:\n${errorMessage}`);
                } else {
                    alert(data.message || 'An error occurred.');
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please check the console for details.');
        });
    });
});
