// Initialize the Leaflet map with a dark background
var map = L.map('map').setView([20, 0], 2); // Centered at the equator

// Add a dark tile layer from CartoDB Dark Matter
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 18
}).addTo(map);

// Variables for plane movement
var plane = document.createElement('div'); // Create a plane element
plane.id = 'plane';
document.body.appendChild(plane);

var planeAngle = 0; // Starting angle
var planeLat = 20;  // Starting latitude (initial map center)
var planeLng = 0;   // Starting longitude (initial map center)

// Function to move and rotate the plane
function movePlane() {
    // Set the plane's new position on the map
    var newPlanePosition = map.latLngToLayerPoint([planeLat, planeLng]);
    plane.style.transform = `translate(${newPlanePosition.x - 20}px, ${newPlanePosition.y - 20}px) rotate(${planeAngle}deg)`; 
}

// Function to move the plane forward in the direction it's facing
function moveForward() {
    // Convert angle to radians
    var angleInRadians = planeAngle * (Math.PI / 180);

    // Update lat and lng based on the plane's current direction
    planeLat += Math.cos(angleInRadians) * 0.5; // Adjust step size
    planeLng += Math.sin(angleInRadians) * 0.5;

    // Keep the plane within the map bounds
    var bounds = map.getBounds();
    planeLat = Math.max(bounds.getSouth(), Math.min(bounds.getNorth(), planeLat));
    planeLng = Math.max(bounds.getWest(), Math.min(bounds.getEast(), planeLng));

    // Update plane's position
    movePlane();
}

// Function to turn the plane left
function turnLeft() {
    planeAngle -= 15; // Rotate left by 15 degrees
    movePlane(); // Update plane rotation
}

// Function to turn the plane right
function turnRight() {
    planeAngle += 15; // Rotate right by 15 degrees
    movePlane(); // Update plane rotation
}

// Adjust plane position when map is moved
map.on('move', function() {
    movePlane(); // Keep the plane in sync with map panning
});

// Initialize the plane on the map
movePlane();

// Load the XML data for DAC countries
d3.xml('dac_data.xml').then(function(data) {
    const locations = data.querySelectorAll('location');
    var locationsData = Array.from(locations).map(function(location) {
        return {
            name: location.querySelector('name').textContent,
            lat: +location.querySelector('lat').textContent,
            lng: +location.querySelector('lng').textContent,
            size: +location.querySelector('size').textContent
        };
    });

    populateCountryFilter(locationsData);
    updateMap('all', locationsData);
}).catch(function(error) {
    console.log('Error loading XML data:', error);
});

// Populate the country filter dropdown
function populateCountryFilter(locationsData) {
    var countryFilter = document.getElementById('countryFilter');
    var uniqueCountries = [...new Set(locationsData.map(location => location.name))];

    uniqueCountries.forEach(function(country) {
        var option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countryFilter.appendChild(option);
    });
}

// Update the map when a country is selected
function updateMap(country, locationsData) {
    // Add bubbles (circles) for DAC countries
    locationsData.forEach(function(location) {
        if (country === 'all' || location.name === country) {
            L.circle([location.lat, location.lng], {
                color: 'white',
                fillColor: 'lightblue',
                fillOpacity: 0.6,
                radius: location.size * 10000
            }).bindPopup(location.name).addTo(map);
        }
    });
}

// Handle filter changes
function filterCountries() {
    var selectedCountry = document.getElementById('countryFilter').value;
    updateMap(selectedCountry, locationsData);
}
