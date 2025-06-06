// const API_KEY = 'YOUR_API_KEY_HERE'; // Shoud be replaced with key from openWeather.co

const API_KEY = '9a87692008b504c87793beb2c34fd723'; // Shoud be replaced with key from openWeather.co

const city = document.getElementById('city');
const search_Btn = document.getElementById('search_Btn');
const location_Btn = document.getElementById('location_Btn');
const currentWeather = document.getElementById('currentWeather');
const forecast = document.getElementById('forecast');
const container = document.getElementById('container');
const recentcities = document.getElementById('recentcities');

search_Btn.addEventListener('click', () => getWeatherdata(city.value));
location_Btn.addEventListener('click', getCurrentLocationWeather);
recentcities.addEventListener('change', () => getWeatherdata(recentcities.value));
window.addEventListener('load', updateSearchList);

// Function to convert Kelvin to celsius as Kelvin is the default for openWeather api
function tempConventor(k) {
    return (k - 273.15).toFixed(1);
}

// Displays the current Weather
function displaycurrentWeather(data) {
    document.getElementById('currentCity').textContent = data.name;
    document.getElementById('temperature').textContent = `Temperature: ${tempConventor(data.main.temp)} °C`;
    document.getElementById('humidity').textContent = `Humidity: ${data.main.humidity}%`;
    document.getElementById('wind').textContent = `Wind: ${data.wind.speed} m/s`;
    document.getElementById('cloudIcon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    currentWeather.classList.remove('hidden');
}

// Displays the 5-day forecasted weather
function displayforecastWeather(data) {
    container.innerHTML = '';
    const day = data.list.filter(entry => entry.dt_txt.includes('12:00:00'));

    day.forEach(day => {
        const card = document.createElement('div');
        card.className = 'bg-slate-50 p-5 rounded shadow';
        card.innerHTML = `
      <p class="font-semibold">${new Date(day.dt_txt).toDateString()}</p>
      <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" class="w-15 h-15" />
      <p>Temp: ${tempConventor(day.main.temp)} °C</p>
      <p>Humidity: ${day.main.humidity}%</p>
      <p>Wind: ${day.wind.speed} m/s</p>
    `;
        container.appendChild(card);
    });

    forecast.classList.remove('hidden');
}

// Fetch Weather data by city name
function getWeatherdata(city) {
    if (!city.trim()) return alert("Enter a city name.");

    addCityToSearch(city);

    // Fetch the current city weather
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`)
        .then(response => response.json())
        .then(result => {
            if (result.cod !== 200) throw new Error(result.message);
            displaycurrentWeather(result);
        })
        .catch(err => alert(err.message));

    // Fetches the forecast data
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}`)
        .then(response => response.json())
        .then(result => displayforecastWeather(result))
        .catch(err => console.error("Forecast fetch failed", err));
}

// Fetch Weather data by current location
function getCurrentLocationWeather() {
    if (!navigator.geolocation) return alert("Geolocation is not supported.");
    // Gets the user Coordinates
    navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;

        // Fetches the current weather data
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`)
            .then(response => response.json())
            .then(result => {
                displaycurrentWeather(result);
                addCityToSearch(result.name);
            });

        //Fetches the forecast weather data
        fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`)
            .then(response => response.json())
            .then(result => displayforecastWeather(result));
    }, () => alert("Unable to get location."));
}

// Add the city name to the recent search list
function addCityToSearch(city) {
    let recent = JSON.parse(localStorage.getItem("recentCities")) || [];
    if (!recent.includes(city)) {
        recent.unshift(city);
        if (recent.length > 5) recent.pop();
        localStorage.setItem("recentCities", JSON.stringify(recent));
        updateSearchList();
    }
}

// Updates the recent search History in the Dropdown
function updateSearchList() {
    let recent = JSON.parse(localStorage.getItem("recentCities")) || [];
    // If there is no recent cities searched, then hide the search dropdown
    if (recent.length === 0) {
        recentcities.classList.add("hidden");
        return;
    }

    // Creates the dropdown menu
    recentcities.classList.remove("hidden");
    recentcities.innerHTML = '<option disabled selected>Select Recent City</option>';

    // Adds the city to the dropdown menu
    recent.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        recentcities.appendChild(option);
    });
}
