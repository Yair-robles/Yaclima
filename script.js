const apiKey = '7e5c4dfe49e8273d95f3873ac42713e1'; // Reemplaza 'TU_CLAVE_API' con tu clave de API de OpenWeatherMap
let map;
let currentMarker;

function initializeMap(lat, lon) {
    if (map) {
        map.remove();
    }
    map = L.map('map').setView([lat, lon], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    map.on('click', function(e) {
        const lat = e.latlng.lat;
        const lon = e.latlng.lng;
        fetchWeatherData(lat, lon, 'currentLocationWeather');
    });
}

function updateMapMarker(lat, lon, iconUrl) {
    if (currentMarker) {
        map.removeLayer(currentMarker);
    }
    const icon = L.icon({
        iconUrl: iconUrl,
        iconSize: [50, 50],
        iconAnchor: [25, 50],
    });
    currentMarker = L.marker([lat, lon], { icon }).addTo(map);
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError, { enableHighAccuracy: true });
    } else {
        alert("La geolocalización no es soportada por este navegador.");
    }
}

async function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    initializeMap(lat, lon);
    await fetchWeatherData(lat, lon, 'currentLocationWeather');
}

async function fetchWeatherData(lat, lon, elementId) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.cod !== 200) {
            alert("No se pudo obtener la información del clima");
            return;
        }
        displayWeather(data, elementId);
    } catch (error) {
        console.error("Error al obtener la información del clima", error);
    }
}

function displayWeather(data, elementId) {
    const weatherResult = document.getElementById(elementId);
    let weatherClass = 'weather-sunny';
    let iconUrl = 'sunny.png';

    if (data.weather[0].main.toLowerCase().includes('rain')) {
        weatherClass = 'weather-rainy';
        iconUrl = 'rainy.png';
    } else if (data.weather[0].main.toLowerCase().includes('cloud')) {
        weatherClass = 'weather-cloudy';
        iconUrl = 'cloudy.png';
    }

    weatherResult.className = weatherClass;
    weatherResult.innerHTML = `
        <h2>${data.name}, ${data.sys.country}</h2>
        <p>Temperatura: ${data.main.temp}°C</p>
        <p>Clima: ${data.weather[0].description}</p>
        <p>Humedad: ${data.main.humidity}%</p>
        <p>Velocidad del viento: ${data.wind.speed} m/s</p>
    `;

    updateMapMarker(data.coord.lat, data.coord.lon, iconUrl);
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            alert("El usuario negó la solicitud de geolocalización.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("La información de ubicación no está disponible.");
            break;
        case error.TIMEOUT:
            alert("La solicitud para obtener la ubicación del usuario ha caducado.");
            break;
        case error.UNKNOWN_ERROR:
            alert("Ha ocurrido un error desconocido.");
            break;
    }
}

// Llama a la función para obtener la ubicación al cargar la página
window.onload = function() {
    if (confirm("¿Permitir el uso de su ubicación para mostrar el clima actual?")) {
        getLocation();
    }
};
