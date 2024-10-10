// Initialize the Leaflet map with a dark background
var map = L.map('map').setView([20, 0], 2); // Centered at the equator

// Add a dark tile layer from CartoDB Dark Matter
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 18
}).addTo(map);

// Variables for plane movement
var plane = document.createElement('div');
plane.id = 'plane';
document.body.appendChild(plane);

var planeAngle = 0;
var planeLat = 20;
var planeLng = 0;

// Move the plane
function movePlane() {
    var newPlanePosition = map.latLngToLayerPoint([planeLat, planeLng]);
    plane.style.transform = `translate(${newPlanePosition.x - 20}px, ${newPlanePosition.y - 20}px) rotate(${planeAngle}deg)`; 
}

// Move plane forward
function moveForward() {
    var angleInRadians = planeAngle * (Math.PI / 180);
    planeLat += Math.cos(angleInRadians) * 0.5;
    planeLng += Math.sin(angleInRadians) * 0.5;

    var bounds = map.getBounds();
    planeLat = Math.max(bounds.getSouth(), Math.min(bounds.getNorth(), planeLat));
    planeLng = Math.max(bounds.getWest(), Math.min(bounds.getEast(), planeLng));

    movePlane();
}

function turnLeft() {
    planeAngle -= 15;
    movePlane();
}

function turnRight() {
    planeAngle += 15;
    movePlane();
}

map.on('move', function() {
    movePlane();
});

movePlane();

// Load XML data
var locationsData = [];
d3.xml('dac_data.xml').then(function(data) {
    const locations = data.querySelectorAll('location');
    locationsData = Array.from(locations).map(function(location) {
        return {
            name: location.querySelector('name').textContent,
            lat: +location.querySelector('lat').textContent,
            lng: +location.querySelector('lng').textContent,
            size: +location.querySelector('size').textContent,
            year: +location.querySelector('year').textContent // Add year attribute
        };
    });

    populateYearSelector(locationsData);
    updateMapByYear('all');
}).catch(function(error) {
    console.log('Error loading XML data:', error);
});

// Populate year selector based on XML data
function populateYearSelector(locationsData) {
    var yearSelector = document.getElementById('yearSelector');
    var uniqueYears = [...new Set(locationsData.map(location => location.year))];

    uniqueYears.forEach(function(year) {
        var option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelector.appendChild(option);
    });
}

// Update map by year
function updateMapByYear(year = 'all') {
    map.eachLayer(function(layer) {
        if (layer instanceof L.Circle) {
            map.removeLayer(layer);
        }
    });

    locationsData.forEach(function(location) {
        if (year === 'all' || location.year == year) {
            L.circle([location.lat, location.lng], {
                color: 'white',
                fillColor: 'lightblue',
                fillOpacity: 0.6,
                radius: location.size * 10000
            }).bindPopup(location.name).addTo(map);
        }
    });
}

// Play button: cycle through years automatically
var intervalId;
function playYearCycle() {
    var yearSelector = document.getElementById('yearSelector');
    var options = Array.from(yearSelector.options);
    var currentIndex = 0;

    // Start the cycle
    intervalId = setInterval(function() {
        currentIndex = (currentIndex + 1) % options.length; // Loop through options
        yearSelector.value = options[currentIndex].value; // Update year selector
        updateMapByYear(options[currentIndex].value); // Update map

        // Stop when reaching the last year
        if (currentIndex === options.length - 1) {
            clearInterval(intervalId);
        }
    }, 2000); // 2-second pause between years
}
