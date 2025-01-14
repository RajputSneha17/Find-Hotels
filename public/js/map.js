const localMapToken = process.env.MAP_TOKEN;  // Your MapTiler token
const map = L.map('map').setView([49.2125578, 16.62662018], 14);

        // Add tile layer to the map
        L.tileLayer(`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${localMapToken}`, {
            tileSize: 512,
            zoomOffset: -1,
            minZoom: 1,
            attribution: `
                <a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a>
                <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>
            `,
            crossOrigin: true
        }).addTo(map);

// Function to search and move map
async function searchLocation() {
    const city = document.getElementById('location-input').innerHTML;  // Get city input
    const country = document.getElementById('country-input').innerHTML;  // Get country input

    // if (!city || !country) {
    //     alert('Please enter both city and country');
    //     return;
    // }

    // Construct full location query (city, country)
    const location = `${city}, ${country}`;

    // Fetch coordinates from MapTiler Geocoding API
    const response = await fetch(`https://api.maptiler.com/geocoding/${location}.json?key=${localMapToken}`);
    const data = await response.json();

    if (data && data.features && data.features.length > 0) {
        const lat = data.features[0].geometry.coordinates[1];
        const lng = data.features[0].geometry.coordinates[0];

        // Move map to searched location
        map.setView([lat, lng], 14);

        // Add marker at searched location
        L.marker([lat, lng]).addTo(map)
            .bindPopup(`<b>${location}</b>`)
            .openPopup();
    } else {
        alert('Location not found. Please try again.');
    }
}

// Event listener for the form submission or input change
// document.getElementById('search-button').addEventListener('click', searchLocation);
searchLocation();