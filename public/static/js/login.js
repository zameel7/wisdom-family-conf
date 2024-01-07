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

// Email/Password login
document.getElementById("loginForm").addEventListener("submit", function (e) {
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
            alert("Login failed. Please check your email and password.");
        });
});

// Google Sign-In
function signInWithGoogle() {
    var provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then(function (result) {
            // This gives you a Google Access Token.
            // You can use it to access the Google API.
            var token = result.credential.accessToken;

            // The signed-in user info.
            var user = result.user;

            // Redirect or perform actions after successful Google Sign-In
            console.log("Google Sign-In successful");
            window.location.replace("/admin.html"); // Replace with the admin page URL
        })
        .catch(function (error) {
            // Handle Google Sign-In errors
            var errorCode = error.code;
            var errorMessage = error.message;
            console.error(errorCode, errorMessage);
            alert("Google Sign-In failed. Please try again.");
        });
}
