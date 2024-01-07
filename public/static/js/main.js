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

// Your list of units
const units = [
    'MIYAPADAV', 'ARIMALA', 'UPPALA', 'KUNJATHTHUR', 'KADAMBAR',
    'PAIVELIKA', 'MACHAMPADY', 'HOSANGADI', 'VORKADY', 'BANDIYOD',
    'MOGRAL', 'ARIKKADY', 'PATLA', 'CHOWKI', 'MOGRAL PUTHUR',
    'KALLAKKATTA', 'PERIYADKKA', 'SP NAGAR', 'BC ROAD', 'ANANGOOR',
    'KASARAGOD TOWN', 'THALANGARA', 'CHOORI', 'BOVIKKANAM', 'CHERKALA',
    'BEVINJE', 'POVVAL', 'MAASTHIKKUND', 'ADOOR', 'ANGADI MUGAR',
    'NEERCHAL', 'PERLA', 'BADIYADUKKA', 'KOMBANADUKKAM', 'PARAVANADUKKAM',
    'CHEMANAD', 'UDUMA PADINJAR', 'MELPARAMB', 'KALANAD', 'PALOTH',
    'KEEZHOOR', 'KUTTIKKOL', 'HOSDURG', 'KOOLIYANGAL', 'PALLIKKARA',
    'NEELESHWARAM', 'AJANUR', 'KOLAVAYAL', 'KALLOORAVI', 'PARAPPA',
    'THRIKKARIPPUR', 'ORIMUKK', 'CHERUVATHTHUR', 'PERUMBATTA', 'PADANNA'
];

// Function to populate the Unit select dropdown
function populateUnitDropdown() {
    const unitSelect = document.getElementById('unit');
    const iunitSelect = document.getElementById('iunit');

    // Clear existing options
    unitSelect.innerHTML = '';

    // Add a default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.text = 'Select Place';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    unitSelect.appendChild(defaultOption);
    iunitSelect.appendChild(defaultOption.cloneNode(true));

    // Add options based on the list of units
    units.forEach((unit) => {
        const option = document.createElement('option');
        option.value = unit;
        option.text = unit;
        unitSelect.appendChild(option);
        iunitSelect.appendChild(option.cloneNode(true));
    });
}

// Call the function to populate the Unit select dropdown
populateUnitDropdown();

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
            const zone = getZoneByUnit(unit);
            const wisdomMember =
                document.getElementById("iwisdomMember").value === "true";
            const transportMode =
                document.getElementById("itransportMode").value;

            // Check if a place is selected
            if (unit === '') {
                alert('Please select a place.');
                document.getElementById("main-disp").style.display = "block";
                document.getElementById("secondary-disp").style.display = "none";
                return;
            }

            // Validate mobile number
            if (!validateMobileNumber(contact)) {
                alert('Please enter a valid mobile number.');
                document.getElementById("main-disp").style.display = "block";
                document.getElementById("secondary-disp").style.display = "none";
                return;
            }


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
                            db.collection("regno").doc(`${registrationNumber}`).set({
                                regNo: registrationNumber
                            })
                            showSuccessScreen([
                                {
                                    name: name,
                                    registrationNumber: registrationNumber,
                                },
                            ]);
                        })
                        .catch((error) => {
                            console.log(error);
                            showErrorScreen();
                        });
                })
                .catch((error) => {
                    console.log(error);
                    showErrorScreen();
                });
        } else if (type === "family") {
            const unit = document.getElementById("unit").value;
            const zone = getZoneByUnit(unit);
            const transportMode =
                document.getElementById("transportMode").value;
            const numberOfMembers =
                parseInt(document.getElementById("numberOfMembers").value);

            // Check if a place is selected
            if (unit === '') {
                alert('Please select a place.');
                document.getElementById("main-disp").style.display = "block";
                document.getElementById("secondary-disp").style.display = "none";
                return;
            }

            // Add family members to Firestore with the same family registration number
            const familyMembers = [];

            for (let i = 0; i <= numberOfMembers; i++) {
                const memberContact = document.getElementById(`contact${i}`).value;
    
                // Validate mobile number
                if (!validateMobileNumber(memberContact)) {
                    alert('Please enter a valid mobile number.');
                    document.getElementById("main-disp").style.display = "block";
                    document.getElementById("secondary-disp").style.display = "none";
                    return;
                }
            }

            // Generate a unique registration number for each family member
            generateUniqueRegistrationNumber()
                .then((memberRegistrationNumber) => {
                    for (let i = 0; i <= numberOfMembers; i++) {
                        const memberName = document.getElementById(`name${i}`).value;
                        const memberAge = document.getElementById(`age${i}`).value;
                        const memberContact = document.getElementById(`contact${i}`).value;
                        const memberWisdomMember = document.getElementById(`wisdomMember${i}`).value === "true";
            
                        // Validate mobile number
                        if (!validateMobileNumber(memberContact)) {
                            alert('Please enter a valid mobile number.');
                            document.getElementById("main-disp").style.display = "block";
                            document.getElementById("secondary-disp").style.display = "none";
                            return;
                        }

                        const regNo = i !== 0 ? `${memberRegistrationNumber}_${i}` : memberRegistrationNumber;

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
                            db.collection("regno").doc(`${regNo}`).set({
                                regNo: regNo
                            })
                            if (i === 0) {
                                // Add the head of the family to the list of family members
                                familyMembers.push({
                                    name: memberName,
                                    registrationNumber: memberRegistrationNumber,
                                });
                            } else {
                                familyMembers.push({
                                    name: memberName,
                                    registrationNumber:
                                        `${memberRegistrationNumber}_${i}`,
                                });
                            }
                            console.log("Family member added successfully");
                        })
                        .catch((error) => {
                            console.error(
                                `Error adding family member document of ${memberRegistrationNumber}_${i+1}: `,
                                error
                            );
                        })
                        .finally(() => {
                            // Show success screen only after all family members have been added
                            if (familyMembers.length === numberOfMembers)
                                showSuccessScreen(familyMembers);
                        });
                    }
                })
                .catch((error) => {
                    console.log(error);
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
                .collection("regno")
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
        <div class="alert alert-success" role="alert">
            <h4 class="alert-heading font-weight-bold">സമ്മേളന രെജിസ്ട്രേഷൻ പൂർത്തിയായിരിക്കുന്നു!</h4>
            <ul id="registrationDetailsList" class="list-group"></ul>
            <p class="mt-2">സമ്മേളന നഗരിയിൽ വച്ച് കാണാം എന്ന പ്രാർത്ഥനയോടെ...</p>
            <p>സ്നേഹിതർക്കു കൂടി ഈ പരിപാടി പരിചയപ്പെടുത്തിക്കൊടുക്കാൻ മറക്കല്ലേ!</p>
            <hr>
            <div id="ticket" style="display: none;">
                <div class="alert alert-success" role="alert">
                    <h4 class="alert-heading font-weight-bold">Registration has been successful!</h4>
                    <ul id="registrationDetailsListTicket" class="list-group"></ul>
                    <p class="mt-2">Here is your ticket for the event</p>
                </div>
            </div>
            <button type="button" class="btn btn-primary mt-2" onclick="window.location.href = 'upi://pay?pa=mynameiszam7@oksbi&cu=INR'">Donate to Da'wa</button>
            <button type="button" class="btn btn-primary mt-2" onclick="formReset()">Register More</button>
            <button type="button" class="btn btn-primary mt-2" onclick="downloadAsPNG()">Download Ticket</button>
        </div>
    `;

    document.getElementById("registrationModalLabel").innerText = "Registration Successful!";
    document.getElementById("secondary-disp").innerHTML = successContent;

    const detailsList = document.getElementById("registrationDetailsList");
    const detailsListTicket = document.getElementById("registrationDetailsListTicket");

    registrationDetails.forEach((detail) => {
        const listItem = document.createElement("li");
        listItem.classList.add("list-group-item");
        listItem.textContent = `${detail.name}: ${detail.registrationNumber}`;
        detailsList.appendChild(listItem);
        detailsListTicket.appendChild(listItem.cloneNode(true));
    });
}

function downloadAsPNG() {
    // Get the content of the "registrationDetailsList" element
    const content = document.getElementById("ticket");
    content.style.display = "block";

    // Use html2canvas to capture the content as an image
    html2canvas(content).then((canvas) => {
        // Convert the canvas to an image URL
        const imgData = canvas.toDataURL("image/png");

        const link = document.createElement("a");

        // Set the download attribute with a filename
        link.download = "registration_success.png";

        // Set the href attribute with the data URL
        link.href = imgData;

        // Append the link to the document
        document.body.appendChild(link);

        // Trigger a click on the link to initiate the download
        link.click();

        // Remove the link from the document
        document.body.removeChild(link);
    });
    content.style.display = "none";
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
                        Retry
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

function getZoneByUnit(unit) {
    const zoneMapping = {
        'MIYAPADAV': 'Manjeshwar',
        'ARIMALA': 'Manjeshwar',
        'UPPALA': 'Manjeshwar',
        'KUNJATHTHUR': 'Manjeshwar',
        'KADAMBAR': 'Manjeshwar',
        'PAIVELIKA': 'Manjeshwar',
        'MACHAMPADY': 'Manjeshwar',
        'HOSANGADI': 'Manjeshwar',
        'VORKADY': 'Manjeshwar',
        'BANDIYOD': 'Manjeshwar',
        'MOGRAL': 'Kumbala',
        'ARIKKADY': 'Kumbala',
        'PATLA': 'Kumbala',
        'CHOWKI': 'Kumbala',
        'MOGRAL PUTHUR': 'Kumbala',
        'KALLAKKATTA': 'Kumbala',
        'PERIYADKKA': 'Kumbala',
        'SP NAGAR': 'Kasaragod',
        'BC ROAD': 'Kasaragod',
        'ANANGOOR': 'Kasaragod',
        'KASARAGOD TOWN': 'Kasaragod',
        'THALANGARA': 'Kasaragod',
        'CHOORI': 'Kasaragod',
        'BOVIKKANAM': 'Cherkala',
        'CHERKALA': 'Cherkala',
        'BEVINJE': 'Cherkala',
        'POVVAL': 'Cherkala',
        'MAASTHIKKUND': 'Cherkala',
        'ADOOR': 'Cherkala',
        'ANGADI MUGAR': 'Badiyadukka',
        'NEERCHAL': 'Badiyadukka',
        'PERLA': 'Badiyadukka',
        'BADIYADUKKA': 'Badiyadukka',
        'KOMBANADUKKAM': 'Uduma',
        'PARAVANADUKKAM': 'Uduma',
        'CHEMANAD': 'Uduma',
        'UDUMA PADINJAR': 'Uduma',
        'MELPARAMB': 'Uduma',
        'KALANAD': 'Uduma',
        'PALOTH': 'Uduma',
        'KEEZHOOR': 'Uduma',
        'KUTTIKKOL': 'Uduma',
        'HOSDURG': 'Kanhangad',
        'KOOLIYANGAL': 'Kanhangad',
        'PALLIKKARA': 'Kanhangad',
        'NEELESHWARAM': 'Kanhangad',
        'AJANUR': 'Kanhangad',
        'KOLAVAYAL': 'Kanhangad',
        'KALLOORAVI': 'Kanhangad',
        'PARAPPA': 'Kanhangad',
        'THRIKKARIPPUR': 'Trikkaripur',
        'ORIMUKK': 'Trikkaripur',
        'CHERUVATHTHUR': 'Trikkaripur',
        'PERUMBATTA': 'Trikkaripur',
        'PADANNA': 'Trikkaripur'
    };

    return zoneMapping[unit];
}

function validateMobileNumber(mobileNumber) {
    // Regular expression for a valid Indian mobile number
    const mobileNumberRegex = /^[6-9]\d{9}$/;
    return mobileNumberRegex.test(mobileNumber);
}