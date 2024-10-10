// Initialize the Leaflet map
var map = L.map('map').setView([20, 0], 2); // Centered at the equator

// Add a tile layer from OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Function to add bubbles (circles) to the map
function addBubble(lat, lng, size, name) {
    L.circle([lat, lng], {
        color: 'blue',
        fillColor: '#30f',
        fillOpacity: 0.5,
        radius: size * 1000  // Adjust scale for display
    }).addTo(map).bindPopup(name);
}

// Load XML data
d3.xml('data.xml').then(function(data) {
    // Parse the XML file
    const locations = data.querySelectorAll('location');

    locations.forEach(function(location) {
        const name = location.querySelector('name').textContent;
        const lat = +location.querySelector('lat').textContent;
        const lng = +location.querySelector('lng').textContent;
        const size = +location.querySelector('size').textContent;

        // Add bubble to the map
        addBubble(lat, lng, size, name);
    });
}).catch(function(error) {
    console.log('Error loading XML data:', error);
});
