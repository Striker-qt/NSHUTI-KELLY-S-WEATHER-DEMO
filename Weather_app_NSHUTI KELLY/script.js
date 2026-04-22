// Weather App - simple JS for school project
// Get free API key from https://www.weatherapi.com/register.aspx 
const API_KEY = '7d93ca77137346ec84181031262204'; // Replace with your key!

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const geoBtn = document.getElementById('geoBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const weatherDisplay = document.getElementById('weatherDisplay');

// Hide/show helpers
function hideAll() {
    loading.classList.add('hidden');
    error.classList.add('hidden');
    weatherDisplay.classList.add('hidden');
}

function showLoading() {
    hideAll();
    loading.classList.remove('hidden');
}

function showError(msg = '') {
    hideAll();
    if (msg) {
        document.querySelector('#error p').textContent = msg;
    }
    error.classList.remove('hidden');
}

// Show weather data
function displayWeather(data) {
    hideAll();
    weatherDisplay.classList.remove('hidden');
    
    // City name
    document.getElementById('cityName').textContent = data.location.name + ', ' + data.location.country;
    document.getElementById('time').textContent = new Date(data.location.localtime).toLocaleString();
    
    // Temp and condition
    document.getElementById('tempValue').textContent = Math.round(data.current.temp_c);
    document.getElementById('conditionText').textContent = data.current.condition.text;
    
    // Emoji for condition (simple)
    const condition = data.current.condition.text.toLowerCase();
    let emoji = '🌤️';
    if (condition.includes('rain')) emoji = '🌧️';
    else if (condition.includes('cloud')) emoji = '☁️';
    else if (condition.includes('sun') || condition.includes('clear')) emoji = '☀️';
    else if (condition.includes('snow')) emoji = '❄️';
    else if (condition.includes('thunder')) emoji = '⛈️';
    document.getElementById('conditionIcon').textContent = emoji;
    
    // Details
    document.getElementById('feelsLike').textContent = Math.round(data.current.feelslike_c) + '°C';
    document.getElementById('humidity').textContent = data.current.humidity + '%';
    document.getElementById('wind').textContent = Math.round(data.current.wind_kph) + ' km/h';
    
    // Save to localStorage
    localStorage.setItem('lastCity', data.location.name);
}

// Get weather for city
async function searchWeather(city) {
    if (!city || !API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
        showError('Please enter city and add your API key!');
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}`);
        if (!response.ok) throw new Error('City not found');
        
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        
        displayWeather(data);
    } catch (err) {
        console.error('Weather error:', err);
        showError(err.message || 'Something went wrong!');
    }
}

// Get user location
function getGeoWeather() {
    if (!navigator.geolocation) {
        showError('Geolocation not supported');
        return;
    }
    
    showLoading();
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            await searchWeather(`${lat},${lon}`);
        },
        (err) => {
            showError('Location access denied. Use search instead.');
        }
    );
}

// Event listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        searchWeather(city);
    } else {
        showError('Please enter a city name');
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

geoBtn.addEventListener('click', getGeoWeather);

// Load last city on start
window.addEventListener('load', () => {
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
        cityInput.value = lastCity;
        // Auto search? Optional, comment out if not wanted
        // searchWeather(lastCity);
    }
    hideAll();
});
