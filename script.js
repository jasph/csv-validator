// Initialize the Leaflet map with a black (dark) background
var map = L.map('map').setView([20, 0], 2); // Centered at the equator

// Add a dark tile layer from CartoDB Dark Matter
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 18
}).addTo(map);

// Variables to hold data and map layers
var locationsData = [];
var markers = [];

// Function to add bubbles (circles) to the map
function addBubble(lat, lng, size, name) {
    var circle = L.circle([lat, lng], {
        color: 'white',
        fillColor: 'lightblue',
        fillOpacity: 0.6,
        radius: size * 10000  // Adjust scale for display (size in XML is abstract)
    }).bindPopup(name).addTo(map);

    markers.push(circle);  // Add the marker to the markers array
}

// Function to clear all bubbles from the map
function clearBubbles() {
    markers.forEach(function(marker) {
        map.removeLayer(marker);
    });
    markers = [];  // Clear the markers array
}

// Load the XML data and display the DAC country points
d3.xml('dac_data.xml').then(function(data) {
    // Parse the XML file
    const locations = data.querySelectorAll('location');
    locationsData = Array.from(locations).map(function(location) {
        return {
            name: location.querySelector('name').textContent,
            lat: +location.querySelector('lat').textContent,
            lng: +location.querySelector('lng').textContent,
            size: +location.querySelector('size').textContent
        };
    });

    // Populate the dropdown filter with countries
    populateCountryFilter();

    // Display all bubbles initially
    updateMap('all');
}).catch(function(error) {
    console.log('Error loading XML data:', error);
});

// Function to populate the country filter dropdown
function populateCountryFilter() {
    var countryFilter = document.getElementById('countryFilter');
    var uniqueCountries = [...new Set(locationsData.map(location => location.name))];

    uniqueCountries.forEach(function(country) {
        var option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countryFilter.appendChild(option);
    });
}

// Function to filter and display only selected countries
function filterCountries() {
    var selectedCountry = document.getElementById('countryFilter').value;
    updateMap(selectedCountry);
}

// Function to update the map with the selected countries
function updateMap(country) {
    clearBubbles();  // Remove any existing bubbles

    locationsData.forEach(function(location) {
        if (country === 'all' || location.name === country) {
            addBubble(location.lat, location.lng, location.size, location.name);
        }
    });
}
