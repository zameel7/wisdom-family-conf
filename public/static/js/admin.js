var auth;

// Listen for auth state changes
document.addEventListener("DOMContentLoaded", function () {
    try {
        auth = firebase.auth();
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                // User is signed in, proceed to retrieve data
                getRegistrationsData();
            } else {
                // User is not signed in, redirect to login page
                window.location.replace("/login.html"); // Replace with your login page URL
            }
        });
        // Firebase Firestore
        var db = firebase.firestore();

        // Fetch all registration details
        var registrationsRef = db.collection("registrations");

        registrationsRef.get().then(function (querySnapshot) {
            var zoneCounts = {}; // Object to store zone counts

            querySnapshot.forEach(function (doc) {
                var registrationData = doc.data();
                displayRegistrationDetails(doc.id, registrationData);
                updateZoneRegistrationCount(registrationData.zone, zoneCounts);
            });

            // Create cards for all zones, including those with zero registrations
            createZoneCards(zoneCounts);
        });

        // Function to display registration details in the table
        function displayRegistrationDetails(registrationNo, data) {
            var tableBody = document.getElementById("registrationTableBody");

            var row = document.createElement("tr");
            row.innerHTML = `
            <td>${registrationNo}</td>
            <td>${data.name}</td>
            <td>${data.age}</td>
            <td>${data.contact}</td>
            <td>${data.zone}</td>
            <td>${data.transportMode}</td>
            <td>${data.unit}</td>
            <td>${data.isFamily ? "Yes" : "No"}</td>
            <td>${data.wisdomMember ? "Yes" : "No"}</td>
        `;

            tableBody.appendChild(row);
        }

        // Function to update zone-wise registration counts in cards
        function updateZoneRegistrationCount(zone, zoneCounts) {
            if (!zoneCounts[zone]) {
                zoneCounts[zone] = 1;
            } else {
                zoneCounts[zone]++;
            }
        }

        // Function to create cards for all zones
        function createZoneCards(zoneCounts) {
            var zoneCountsElement = document.getElementById(
                "zoneRegistrationCounts"
            );

            // List of all zones you want to display
            var allZones = [
                "Trikkaripur",
                "Kanhangad",
                "Uduma",
                "Badiyadukka",
                "Cherkala",
                "Kasaragod",
                "Kumbala",
                "Manjeshwar",
            ];

            // Iterate through all zones
            allZones.forEach(function (zone) {
                var count = zoneCounts[zone] || 0; // If the zone doesn't exist in counts, set count to 0

                // Create or update the card
                var zoneCard = document.createElement("div");
                zoneCard.className = "card";
                zoneCard.id = `zoneCard_${zone}`;
                zoneCard.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">${zone}</h5>
                    <p class="card-text">Count: ${count}</p>
                </div>
            `;

                zoneCountsElement.appendChild(zoneCard);
            });

            function domReady(fn) {
                if (
                    document.readyState === "complete" ||
                    document.readyState === "interactive"
                ) {
                    setTimeout(fn, 1000);
                } else {
                    document.addEventListener("DOMContentLoaded", fn);
                }
            }

            domReady(function () {
                // If found you qr code
                function onScanSuccess(decodeText, decodeResult) {
                    var result = JSON.parse(decodeText);
                    result.forEach((data) => {
                        const registrationNumber = data.registrationNumber;
                        if (registrationNumber) {
                            markAttendance(registrationNumber);
                        }
                    });
                }

                let htmlscanner = new Html5QrcodeScanner("qr-reader", {
                    fps: 10,
                    qrbos: 250,
                });
                htmlscanner.render(onScanSuccess);
            });
        }
    } catch (e) {
        console.error(e);
    }
});

function markAttendance(registrationNumber) {
    try {
        var db = firebase.firestore();
        db.collection("regno").doc(Number(registrationNumber)).set(
            {attendance: true},{ merge: true }
        )
        .then(() => {
            // show bootstrap toast with success message

        })
        .catch((error) => {
            console.error("Error writing document: ", error);
        });
    } catch (e) {
        console.error(`Error marking attendance for ${registrationNumber}`, e);
    }   
}

// Logout function
function logout() {
    auth.signOut()
        .then(function () {
            // Redirect or perform actions after successful logout
            console.log("Logout successful");
            window.location.replace("/login.html"); // Replace with the login page URL
        })
        .catch(function (error) {
            // Handle logout errors
            console.error("Logout failed", error);
            alert("Logout failed. Please try again.");
        });
}

function getRegistrationsData() {
    var db = firebase.firestore();
    var registrationsRef = db.collection("registrations");

    registrationsRef.get().then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
            // Access data using doc.data() and perform actions
            console.log(doc.id, " => ", doc.data());
        });
    });
}
