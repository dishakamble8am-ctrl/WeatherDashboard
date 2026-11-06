// ======================================
// WEATHER DASHBOARD
// ======================================


// GET WEATHER FUNCTION

async function getWeather(cityFromHistory = null) {

    const city = cityFromHistory ||
        document.getElementById("cityInput").value.trim();

    const errorMessage =
        document.getElementById("errorMessage");

    const dashboard =
        document.getElementById("weatherDashboard");

    const loader =
        document.getElementById("loader");

    const searchButton =
        document.getElementById("searchButton");


    // EMPTY INPUT CHECK

    if (city === "") {

        errorMessage.innerText = "Please enter a city name.";

        return;

    }


    try {

        errorMessage.innerText = "";

        dashboard.classList.add("d-none");

        loader.classList.remove("d-none");

        searchButton.disabled = true;


        // ==================================
        // STEP 1: GEOCODING API
        // ==================================

        const geoURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;


        const geoResponse = await fetch(geoURL);


        if (!geoResponse.ok) {

            throw new Error("Unable to search for this city.");

        }


        const geoData = await geoResponse.json();


        if (!geoData.results || geoData.results.length === 0) {

            throw new Error("City not found. Try another city.");

        }


        const location = geoData.results[0];


        const latitude = location.latitude;

        const longitude = location.longitude;


        // ==================================
        // STEP 2: WEATHER API
        // ==================================

        const weatherURL =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=5&timezone=auto`;


        const weatherResponse = await fetch(weatherURL);


        if (!weatherResponse.ok) {

            throw new Error("Unable to fetch weather information.");

        }


        const weatherData = await weatherResponse.json();


        const current = weatherData.current;

        const daily = weatherData.daily;


        // ==================================
        // STEP 3: CURRENT WEATHER
        // ==================================


        document.getElementById("cityName").innerText =
            `${location.name}, ${location.country}`;


        document.getElementById("temperature").innerText =
            `${current.temperature_2m} °C`;


        document.getElementById("feelsLike").innerText =
            `${current.apparent_temperature} °C`;


        document.getElementById("humidity").innerText =
            `${current.relative_humidity_2m}%`;


        document.getElementById("windSpeed").innerText =
            `${current.wind_speed_10m} km/h`;


        document.getElementById("weatherDescription").innerText =
            getWeatherDescription(current.weather_code);


        document.getElementById("weatherIcon").innerText =
            getWeatherIcon(current.weather_code, current.is_day);


        // ==================================
        // STEP 4: LOCAL TIME
        // ==================================


        document.getElementById("localTime").innerText =
            `Local Time: ${current.time.replace("T", " ")}`;


        // ==================================
        // STEP 5: FIVE DAY FORECAST
        // ==================================


        displayForecast(daily);


        // ==================================
        // STEP 6: SEARCH HISTORY
        // ==================================


        saveSearch(location.name);


        displayHistory();


        // SHOW DASHBOARD

        dashboard.classList.remove("d-none");


    }


    catch (error) {

        errorMessage.innerText = error.message;

        dashboard.classList.add("d-none");

    }


    finally {

        loader.classList.add("d-none");

        searchButton.disabled = false;

    }

}



// ======================================
// WEATHER DESCRIPTION
// ======================================


function getWeatherDescription(code) {

    const conditions = {

        0: "Clear Sky",

        1: "Mainly Clear",

        2: "Partly Cloudy",

        3: "Overcast",

        45: "Foggy",

        48: "Depositing Rime Fog",

        51: "Light Drizzle",

        53: "Moderate Drizzle",

        55: "Dense Drizzle",

        56: "Freezing Drizzle",

        57: "Freezing Drizzle",

        61: "Light Rain",

        63: "Moderate Rain",

        65: "Heavy Rain",

        66: "Freezing Rain",

        67: "Freezing Rain",

        71: "Light Snow",

        73: "Moderate Snow",

        75: "Heavy Snow",

        77: "Snow Grains",

        80: "Rain Showers",

        81: "Moderate Rain Showers",

        82: "Heavy Rain Showers",

        85: "Snow Showers",

        86: "Heavy Snow Showers",

        95: "Thunderstorm",

        96: "Thunderstorm with Hail",

        99: "Heavy Thunderstorm"

    };


    return conditions[code] || "Weather Unavailable";

}



// ======================================
// WEATHER ICONS
// ======================================


function getWeatherIcon(code, isDay = 1) {

    if (code === 0) {

        return isDay ? "☀️" : "🌙";

    }

    if (code === 1) {

        return isDay ? "🌤️" : "🌙";

    }

    if (code === 2) {

        return "⛅";

    }

    if (code === 3) {

        return "☁️";

    }

    if ([45, 48].includes(code)) {

        return "🌫️";

    }

    if ([51, 53, 55, 56, 57].includes(code)) {

        return "🌦️";

    }

    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {

        return "🌧️";

    }

    if ([71, 73, 75, 77, 85, 86].includes(code)) {

        return "❄️";

    }

    if ([95, 96, 99].includes(code)) {

        return "⛈️";

    }

    return "🌍";

}



// ======================================
// FIVE DAY FORECAST
// ======================================


function displayForecast(daily) {

    const container =
        document.getElementById("forecastContainer");


    container.innerHTML = "";


    for (let i = 0; i < daily.time.length; i++) {

        const date = new Date(daily.time[i] + "T00:00:00");


        const day = date.toLocaleDateString("en-US", {

            weekday: "short"

        });


        const icon = getWeatherIcon(daily.weather_code[i]);


        const description =
            getWeatherDescription(daily.weather_code[i]);


        const card = document.createElement("div");

        card.className = "col-6 col-md";


        const cardContent = document.createElement("div");

        cardContent.className = "forecast-card";


        const dayElement = document.createElement("h5");

        dayElement.textContent = day;


        const iconElement = document.createElement("div");

        iconElement.className = "forecast-icon";

        iconElement.textContent = icon;


        const descriptionElement = document.createElement("p");

        descriptionElement.textContent = description;


        const temperatureElement = document.createElement("h6");

        temperatureElement.textContent =
            `${daily.temperature_2m_max[i]}° / ${daily.temperature_2m_min[i]}°`;


        const rainElement = document.createElement("p");

        rainElement.textContent =
            `Rain: ${daily.precipitation_probability_max[i] ?? "N/A"}%`;


        cardContent.append(
            dayElement,
            iconElement,
            descriptionElement,
            temperatureElement,
            rainElement
        );


        card.appendChild(cardContent);

        container.appendChild(card);

    }

}



// ======================================
// SEARCH HISTORY
// ======================================


function saveSearch(city) {

    let history = JSON.parse(
        localStorage.getItem("weatherHistory")
    ) || [];


    history = history.filter(
        item => item.toLowerCase() !== city.toLowerCase()
    );


    history.unshift(city);


    history = history.slice(0, 5);


    localStorage.setItem(
        "weatherHistory",
        JSON.stringify(history)
    );

}



// DISPLAY HISTORY


function displayHistory() {

    const historyContainer =
        document.getElementById("searchHistory");


    const history = JSON.parse(
        localStorage.getItem("weatherHistory")
    ) || [];


    historyContainer.innerHTML = "";


    history.forEach(city => {

        const button = document.createElement("button");

        button.className = "history-btn";

        button.textContent = city;


        button.addEventListener("click", function() {

            document.getElementById("cityInput").value = city;

            getWeather(city);

        });


        historyContainer.appendChild(button);

    });

}



// ======================================
// ENTER KEY SEARCH
// ======================================


document.getElementById("cityInput").addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            getWeather();

        }

    }
);


// SEARCH BUTTON


document.getElementById("searchButton").addEventListener(
    "click",
    function() {

        getWeather();

    }
);


// LOAD PREVIOUS SEARCH HISTORY


displayHistory();