// Firebase Authentication Script
var auth;

document.addEventListener("DOMContentLoaded", function () {
    try {
        auth = firebase.auth();

        // Email/Password login
        document
            .getElementById("loginForm")
            .addEventListener("submit", function (e) {
                e.preventDefault();

                var email = document.getElementById("email").value;
                var password = document.getElementById("password").value;

                auth.signInWithEmailAndPassword(email, password)
                    .then(function () {
                        // Redirect or perform actions after successful login
                        console.log("Login successful");
                        window.location.replace("/admin.html"); // Replace with the admin page URL
                    })
                    .catch(function (error) {
                        // Handle login errors
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        console.error(errorCode, errorMessage);
                        alert(
                            "Login failed. Please check your email and password."
                        );
                    });
            });
    } catch (e) {
        console.error(e);
    }
});