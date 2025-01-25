// Import necessary Firebase libraries
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js';
import { getDatabase, ref, onValue } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-database.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBFLRhQmQnTY1-FfjKXXV_-Vj58hG_N8Rk",
    authDomain: "plc-cloud-652af.firebaseapp.com",
    databaseURL: "https://plc-cloud-652af-default-rtdb.firebaseio.com",
    projectId: "plc-cloud-652af",
    storageBucket: "plc-cloud-652af.appspot.com",
    messagingSenderId: "267486390127",
    appId: "1:267486390127:web:6d4336249de2e284a5aa9a"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);

// Authenticate user
export function authenticate() {
    const usernameInput = document.getElementById('userId');
    const passwordInput = document.getElementById('password');
    const enteredPassword = passwordInput.value;
    const enteredUsername = usernameInput.value.split('@')[0];

    // Fetch the correct password from Firebase
    const passwordRef = ref(database, `/${enteredUsername}/plc_password`);
    onValue(passwordRef, (snapshot) => {
        const correctPassword = snapshot.val();

        if (enteredPassword === correctPassword) {
            // Correct password
            sessionStorage.setItem('username', enteredUsername);
            localStorage.setItem('username', enteredUsername);
            localStorage.setItem('password', enteredPassword);

            document.getElementById('login-container').style.display = 'none';
            document.getElementById('data-container').style.display = 'block';

            fetchAndDisplayData(enteredUsername);
        } else {
            alert('Incorrect password. Please try again.');
        }
    }, (error) => {
        console.error("Error authenticating user:", error);
        alert("An error occurred while logging in. Please try again.");
    });
}

// Fetch and display data from Firebase
function fetchAndDisplayData(userId) {
    const tableBody = document.getElementById('data-table');
    const userRef = ref(database, userId);

    // Add loading indicator
    tableBody.innerHTML = '<tr><td colspan="2">Loading...</td></tr>';

    // Listen for data updates
    onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        const timeParams = data?.parameters || [];
        const timeData = data?.values || [];

        // Clear the table
        tableBody.innerHTML = '';

        // Populate rows dynamically
        for (let i = 0; i < Math.max(timeParams.length, timeData.length); i++) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${timeParams[i] || ''}</td>
                <td>${timeData[i] || ''}</td>
            `;
            tableBody.appendChild(row);
        }
    }, (error) => {
        console.error("Error fetching data:", error);
        tableBody.innerHTML = '<tr><td colspan="2">Error loading data. Please try again later.</td></tr>';
    });
}

// Auto-login if credentials are stored
function autoLogin() {
    const savedUsername = localStorage.getItem('username');
    const savedPassword = localStorage.getItem('password');

    if (savedUsername && savedPassword) {
        const passwordRef = ref(database, `/${savedUsername}/plc_password`);
        onValue(passwordRef, (snapshot) => {
            const correctPassword = snapshot.val();
            if (savedPassword === correctPassword) {
                document.getElementById('login-container').style.display = 'none';
                document.getElementById('data-container').style.display = 'block';

                fetchAndDisplayData(savedUsername);
            } else {
                alert('Saved credentials are invalid. Please log in again.');
                localStorage.clear();
            }
        }, (error) => {
            console.error("Error checking stored credentials:", error);
        });
    }
}

// Handle login form submission
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    authenticate();
});

// Trigger auto-login on page load
document.addEventListener('DOMContentLoaded', autoLogin);
