import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, update, get } from 'firebase/database';

// Correct Firebase config with possible sensitive data redacted
const firebaseConfig = {
    apiKey: "AIzaSyAuenrhdFYXAtvH4PvLFUiH6nt6icgXxac",
    authDomain: "bus-info-efbd6.firebaseapp.com",
    databaseURL: "https://bus-info-efbd6-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "bus-info-efbd6",
    storageBucket: "bus-info-efbd6.appspot.com",
    messagingSenderId: "91874115698",
    appId: "1:91874115698:web:d933498b73a927437f02eb"
};

// Initialize Firebase app
initializeApp(firebaseConfig);

// Get the Realtime Database instance
const db = getDatabase();

const busRef = ref(db, 'Bus'); // Use the appropriate path for the bus data


// Function to retrieve data from Realtime Database
function retrieveData() {
    // Specify the reference path in the Realtime Database

    // Set up a listener using the onValue method
    onValue(busRef, (snapshot) => {
        if (snapshot.exists()) {
            // Retrieve the data from the snapshot
            const busData = snapshot.val();

            // Update the HTML page with the retrieved data
            updatePage(busData);
        } else {
            console.log('No data available at the specified path');
        }
    }, (error) => {
        console.error('Error retrieving data from Realtime Database:', error);
    });
}


// Function to update the HTML page with retrieved data
function updatePage(data) {
    // Update the Temperature knob
    const temperatureKnob = document.querySelectorAll('.col-6.col-md-3.text-center')[0].querySelector('input.knob');
    $(temperatureKnob).val(data.Environment.Temperature).trigger('change');

    // Update the Humidity knob
    const humidityKnob = document.querySelectorAll('.col-6.col-md-3.text-center')[1].querySelector('input.knob');
    $(humidityKnob).val(data.Environment.Humidity).trigger('change');

    // Update the Gyro knob
    const gyroKnob = document.querySelectorAll('.col-6.col-md-3.text-center')[2].querySelector('input.knob');
    $(gyroKnob).val(data.Environment.Gyro).trigger('change');
}
async function getAllIDValues() {
    const idRef = ref(db, 'IDs');

    try {
        // Listen for real-time updates on the ID reference
        onValue(idRef, (snapshot) => {
            if (snapshot.exists()) {
                // Get the data from the snapshot
                const idData = snapshot.val();

                // Initialize an array to store all ID values
                const idArray = [];

                // Iterate through the idData object and collect values
                for (const key in idData) {
                    if (idData.hasOwnProperty(key)) {
                        // Push each value into the array
                        idArray.push(idData[key]);
                    }
                }

                console.log('All ID values:', idArray);
                // Update the desiredValues array
                desiredValues = idArray;
            } else {
                console.log('No data available at the specified path');
                // If no data exists, reset the desiredValues array
                desiredValues = [];
            }
        }, (error) => {
            console.error('Error retrieving ID values:', error);
            // If an error occurs, reset the desiredValues array
            desiredValues = [];
        });
    } catch (error) {
        console.error('Error setting up ID listener:', error);
        // If an error occurs, reset the desiredValues array
        desiredValues = [];
    }
}


var desiredValues = []; // Add more values as needed

function compareIdWithDesiredValues(id) {
    if (Array.isArray(desiredValues)) {
        return desiredValues.includes(id);
    } else {
        console.error('desiredValues is not an array');
        return false;
    }
}
function initAutocomplete() {
    var map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: 0, lng: 0 }, // Default center until data is loaded
      zoom: 15
    });
  
    var marker = new google.maps.Marker({
      position: { lat: 0, lng: 0 }, // Default position until data is loaded
      map: map,
      title: 'Current Location'
    });
  
    // Reference to the location node in your Realtime Database
    var locationRef = ref(db, 'Bus');
  
    // Listen for changes in location data
    onValue(locationRef, (snapshot) => {
      if (snapshot.exists()) {
        const location = snapshot.val();
        const latLng = { lat: location.Location.Latitude, lng: location.Location.Longitude };
        map.setCenter(latLng);
        marker.setPosition(latLng);
      } else {
        console.log('Location data not found in Firebase.');
      }
    }, (error) => {
      console.error('Error retrieving location from Firebase:', error);
    });
}

async function updateButtonValue(buttonValue) {
    try {
        // Create an update object
        const updates = {
            Button: buttonValue,
        };

        // If button value is set to 0, also set CardID to '000000000000'
        if (buttonValue === 0) {
            updates['Card/ID'] = '000000000000';
        }

        // Perform the update in the database
        await update(busRef, updates);
        console.log(`Button value updated to: ${buttonValue}, CardID updated to: ${updates['Card/ID']}`);

        // If the button value is not 0, reset it to 0 after 2 seconds
        if (buttonValue !== 0) {
            setTimeout(() => {
                // Reset Button value and CardID to 0 values
                update(busRef, { Button: 0, 'Card/ID': '000000000000' })
                    .then(() => {
                        console.log('Button value and CardID reset to 0');
                    })
                    .catch((error) => {
                        console.error('Error resetting Button value and CardID:', error);
                    });
            }, 8000);
        }
    } catch (error) {
        console.error('Error updating Button and CardID:', error);
    }
}

// Function to listen for changes in Card.ID within Bus
async function listenToCardID() {
    desiredValues = await getAllIDValues();
    console.log(desiredValues);

    onValue(busRef, (snapshot) => {
        if (snapshot.exists()) {
            const busData = snapshot.val();
            // Retrieve Card ID
            const cardID = busData.Card && busData.Card.ID;
            
            if (cardID !== undefined) {
                // If Card ID is '000000000000', keep Button value as 0
                if (cardID === '000000000000') {
                    updateButtonValue(0);
                } else if (compareIdWithDesiredValues(cardID)) {
                    // If the Card ID is in the list of desired values, update Button value to 1
                    updateButtonValue(1);
                } else {
                    // Otherwise, update Button value to 2
                    updateButtonValue(2);
                }
            }
        } else {
            console.log('No data available at the specified path');
        }
    }, (error) => {
        console.error('Error retrieving data from Realtime Database:', error);
    });
}
listenToCardID();
// Make the function available globally if needed
window.retrieveData = retrieveData;

window.initAutocomplete = initAutocomplete;


