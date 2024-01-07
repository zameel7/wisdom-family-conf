let db;
let type;

document.addEventListener("DOMContentLoaded", function () {
    try {
        let app = firebase.app();
        let features = [
            "auth",
            "database",
            "firestore",
            "functions",
            "messaging",
            "storage",
            "analytics",
            "remoteConfig",
            "performance",
        ].filter((feature) => typeof app[feature] === "function");

        db = firebase.firestore();
    } catch (e) {
        console.error(e);
    }
});
function selectRegistrationType(registrationType) {
    var registrationForm = document.getElementById("registrationForm");
    var familyFields = document.getElementById("familyFields");
    var individualFields = document.getElementById("individualFields");

    registrationForm.style.display = "block";

    if (registrationType === "family") {
        type = "family";
        familyFields.style.display = "block";
        individualFields.style.display = "none";
    } else {
        type = "individual";
        familyFields.style.display = "none";
        individualFields.style.display = "block";
    }
}

function updateFamilyMembersDetails() {
    var numberOfMembers = document.getElementById("numberOfMembers").value;
    var familyMembersDetails = document.getElementById("familyMembersDetails");

    familyMembersDetails.innerHTML = ""; // Clear previous content

    for (var i = 0; i < numberOfMembers; i++) {
        var memberDetails = document.createElement("div");
        memberDetails.innerHTML =
            `<h5>Family Member ${i+1}` +
            ":</h5>" +
            "<div class='form-group'><label for='name" +
            i +
            "'>Name:</label><input type='text' class='form-control' id='name" +
            i +
            "' required></div>" +
            "<div class='form-group'><label for='age" +
            i +
            "'>Age:</label><input type='number' class='form-control' id='age" +
            i +
            "' required></div>" +
            "<div class='form-group'><label for='contact" +
            i +
            "'>Contact:</label><input type='text' class='form-control' id='contact" +
            i +
            "' required></div>" +
            "<div class='form-group'><label for='wisdomMember" +
            i +
            "'>Wisdom Member:</label><select class='form-control' id='wisdomMember" +
            i +
            "' required><option value='true'>Yes</option><option value='false'>No</option></select></div>" +
            "<hr>";

        familyMembersDetails.appendChild(memberDetails);
    }
}

function submitForm() {
    // Show loading screen in the modal
    showLoadingScreen();
    
    try {
        if (type === "individual") {
            const name = document.getElementById("name").value;
            const age = document.getElementById("age").value;
            const contact = document.getElementById("contact").value;
            const unit = document.getElementById("iunit").value;
            const zone = document.getElementById("izone").value;
            const wisdomMember =
                document.getElementById("iwisdomMember").value === "true";
            const transportMode =
                document.getElementById("itransportMode").value;


            // Generate a unique 5-digit registration number
            generateUniqueRegistrationNumber()
                .then((registrationNumber) => {
                    console.log(
                        "Unique registration number generated: ",
                        registrationNumber
                    );

                    // Add individual data to Firestore with custom document ID
                    db.collection("registrations")
                        .doc(`${registrationNumber}`)
                        .set({
                            name: name,
                            age: age,
                            contact: contact,
                            unit: unit,
                            zone: zone,
                            wisdomMember: wisdomMember,
                            transportMode: transportMode,
                            isFamily: false
                        })
                        .then(() => {
                            showSuccessScreen([
                                {
                                    name: name,
                                    registrationNumber: registrationNumber,
                                },
                            ]);
                        })
                        .catch((error) => {
                            showErrorScreen();
                        });
                })
                .catch((error) => {
                    showErrorScreen();
                });
        } else if (type === "family") {
            const unit = document.getElementById("unit").value;
            const zone = document.getElementById("zone").value;
            const transportMode =
                document.getElementById("transportMode").value;
            const numberOfMembers =
                parseInt(document.getElementById("numberOfMembers").value);

            // Add family members to Firestore with the same family registration number
            const familyMembers = [];
            // Generate a unique registration number for each family member
            generateUniqueRegistrationNumber()
                .then((memberRegistrationNumber) => {
                    for (let i = 0; i <= numberOfMembers; i++) {
                        const memberName = document.getElementById(`name${i}`).value;
                        const memberAge = document.getElementById(`age${i}`).value;
                        const memberContact = document.getElementById(`contact${i}`).value;
                        const memberWisdomMember = document.getElementById(`wisdomMember${i}`).value === "true";

                        // Add family member data to Firestore with custom document ID
                        db.collection("registrations")
                            .doc(`${memberRegistrationNumber}_${i+1}`)
                            .set({
                                name: memberName,
                                age: memberAge,
                                contact: memberContact,
                                isFamily: true,
                                unit: unit,
                                zone: zone,
                                transportMode: transportMode,
                                numberOfMembers: numberOfMembers,
                                wisdomMember: memberWisdomMember
                            })
                            .then(() => {
                                familyMembers.push({
                                    name: memberName,
                                    registrationNumber:
                                        `${memberRegistrationNumber}_${i+1}`,
                                });
                                console.log("Family member added successfully");
                            })
                            .catch((error) => {
                                console.error(
                                    `Error adding family member document of ${memberRegistrationNumber}_${i+1}: `,
                                    error
                                );
                                showErrorScreen();
                            }
                        );
                    }
                    showSuccessScreen(familyMembers);
                })
                .catch((error) => {
                    console.log(error);
                    showErrorScreen();
                });
            
        }
    } catch (error) {
        console.error(error);
        showErrorScreen();
    }
}

// Function to generate a unique 5-digit registration number
async function generateUniqueRegistrationNumber() {
    const min = 1000;
    let registrationNumber;

    // Try generating a unique registration number up to 10 times
    for (let attempt = 1; attempt <= 10000; attempt++) {
        registrationNumber = min + attempt;

        try {
            // Check if the generated number already exists in Firestore
            const docRef = db
                .collection("registrations")
                .doc(`${registrationNumber}`);
            const docSnapshot = await docRef.get();

            if (!docSnapshot.exists) {
                // The number is unique, break out of the loop
                break;
            }
        } catch (error) {
            console.error("Error checking document existence: ", error);
            // Handle the error as needed
            throw error;
        }
    }

    return registrationNumber;
}

function showLoadingScreen() {
    // Update modal content to show a loading screen
    // You can customize this based on your UI design
    document.getElementById("main-disp").style.display = "none";

    // Show the secondary display with the loading screen
    document.getElementById("secondary-disp").style.display = "block";
    document.getElementById("secondary-disp").innerHTML = `
                    <div class="spinner-border" role="status">
                        <span class="sr-only">Loading...</span>
                    </div> 
                    <p id="load">Please wait while we are processing your request!</p>
                `;
}

function showSuccessScreen(registrationDetails) {
    // Update modal content to show a success screen
    document.getElementById("main-disp").style.display = "none";
    document.getElementById("secondary-disp").style.display = "block";
    
    const successContent = `
					<ul id="registrationDetailsList"></ul>
                    <button
                        type="button"
                        class="btn btn-primary"
                        onclick="formReset()"
                    >
                        Close
                    </button>
				`;

    document.getElementById("registrationModalLabel").innerText =
        "Registration Successful";
    document.getElementById("secondary-disp").innerHTML = successContent;

    const detailsList = document.getElementById("registrationDetailsList");

    registrationDetails.forEach((detail) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${detail.name}: ${detail.registrationNumber}`;
        detailsList.appendChild(listItem);
    });
}

function showErrorScreen() {
    // Update modal content to show an error screen
    document.getElementById("main-disp").style.display = "none";
    document.getElementById("secondary-disp").style.display = "block";

    const errorContent = `
					<p>Sorry, there was an error processing your registration.<br> Please try again later.</p>
                    <button
                        type="button"
                        class="btn btn-primary"
                        onclick="formReset()"
                    >
                        Close
                    </button>
				`;
    document.getElementById("registrationModalLabel").innerText =
        "Registration Failed";
    document.getElementById("secondary-disp").innerHTML = errorContent;
}

function formReset() {
    // Reset the form to its initial state
    document.getElementById("registrationForm").reset();
    document.getElementById("registrationModalLabel").innerText = "Registration Form";
    document.getElementById("main-disp").style.display = "block";
    document.getElementById("secondary-disp").style.display = "none";
}
