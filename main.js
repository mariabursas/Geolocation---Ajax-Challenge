const currentWeather = document.querySelector("#current");
const hourlyWeather = document.querySelector("#hourly");
const dailyWeatherContainer = document.querySelector("#dailyContent");

const prevButton = document.querySelector(".prev");
const nextButton = document.querySelector(".next");
const root = "https://api.openweathermap.org/";
let slides = [];
let currentSlideIndex = 0;

let longitude;
let latitude;

async function getWeather(longitude, latitude) {
  try {
    slides = [];
    currentSlideIndex = 0;
    const response = await fetch(
      `${root}data/2.5/onecall?lat=${latitude}&lon=${longitude}&appid=40548cc5b12a46ee9418e263dd707583`,
      {
        method: "GET",
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch weather data");
    }
    let weatherResponse = await response.json();
    const currentDescription = document.createElement("div");
    const currentDescriptionImage = document.createElement("img");
    currentDescriptionImage.src = `https://openweathermap.org/img/wn/${weatherResponse.current.weather[0].icon}@2x.png`;
    currentDescription.textContent =
      weatherResponse.current.weather[0].description;
    const currentTemperatureCelsius = document.createElement("div");
    let temp = weatherResponse.current.temp;
    currentTemperatureCelsius.textContent =
      Math.floor(temp - 273.15) + " Celsius degrees";
    const currentTemperatureFahrenheit = document.createElement("div");
    currentTemperatureFahrenheit.textContent =
      Math.floor(((temp - 273.15) * 9) / 5 + 32) + " Fahrenheit degrees";

    getHourlyHour(weatherResponse);

    currentDescription.appendChild(currentDescriptionImage);
    currentWeather.appendChild(currentDescription);
    currentWeather.appendChild(currentTemperatureCelsius);
    currentWeather.appendChild(currentTemperatureFahrenheit);

    updateSlide();
    getDailyForecast(weatherResponse);
  } catch (error) {
    console.log(`error is returned ${error}`);
  }
}

function getPosition() {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
      getWeather(longitude, latitude);
    },
    (error) => {
      console.log(error);
    }
  );
}

getPosition();

prevButton.addEventListener("click", () => {
  currentSlideIndex = Math.max(currentSlideIndex - getVisibleSlides(), 0);
  updateSlide();
});

nextButton.addEventListener("click", () => {
  currentSlideIndex = Math.min(
    currentSlideIndex + getVisibleSlides(),
    slides.length + 1 - getVisibleSlides()
  );
  updateSlide();
});

function getHourlyHour(weatherResponse) {
  let hourlyWeatherList = weatherResponse.hourly;
  let counter = 0;
  hourlyWeatherList.forEach((element) => {
    const currentUTC = new Date();
    currentUTC.setUTCHours(currentUTC.getUTCHours() + 2);

    if (element.dt > currentUTC.getTime() / 1000) {
      counter++;
      if (counter <= 12) {
        const unixTime = element.dt;
        const milliseconds = unixTime * 1000;
        const date = new Date(milliseconds);
        date.setUTCHours(date.getUTCHours());
        const hour = date.getUTCHours();

        const minutes = date.getUTCMinutes().toString().padStart(2, "0");
        const weatherHour = document.createElement("div");
        weatherHour.textContent = `${hour}:${minutes}`;
        const hourlyContent = document.createElement("div");
        hourlyContent.classList.add("hourlyItem");
        const hourlyDescription = document.createElement("div");
        hourlyDescription.textContent = element.weather[0].description;
        const hourlyIcon = document.createElement("img");
        hourlyIcon.src = `https://openweathermap.org/img/wn/${element.weather[0].icon}@2x.png`;
        const hourlyTemperatureCelsius = document.createElement("div");
        let tempHourly = element.temp;
        hourlyTemperatureCelsius.textContent =
          Math.floor(tempHourly - 273.15) + " Celsius";

        hourlyContent.appendChild(weatherHour);
        hourlyContent.appendChild(hourlyDescription);
        hourlyContent.appendChild(hourlyIcon);
        hourlyContent.appendChild(hourlyTemperatureCelsius);
        slides.push(hourlyContent);
        hourlyWeather.appendChild(hourlyContent);
      }
    }
  });
}

function updateSlide() {
  const slideWidth = hourlyWeather.clientWidth / getVisibleSlides();
  const translationAmount = currentSlideIndex * slideWidth * 1.02;
  hourlyWeather.style.transform = `translateX(-${translationAmount}px)`;
}

function getVisibleSlides() {
  const containerWidth = hourlyWeather.clientWidth;
  const slideWidth =
    slides.length > 0 ? slides[0].getBoundingClientRect().width : 0;
  return Math.floor(containerWidth / slideWidth);
}

function getDailyForecast(weatherResponse) {
  let dailyWeatherList = weatherResponse.daily;
  dailyWeatherList.forEach((element) => {
    const daily = document.createElement("div");
    daily.classList.add("dailySlide");
    const unixTime = element.dt;
    const milliseconds = unixTime * 1000;
    const dateObject = new Date(milliseconds);
    const year = dateObject.getFullYear();
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    let monthIndex = dateObject.getMonth();
    let month = monthNames[monthIndex];
    const date = dateObject.getDate();
    const dailyDate = document.createElement("div");

    dailyDate.textContent = `${date}, ${month}, ${year}`;
    const weatherDaily = document.createElement("div");
    weatherDaily.textContent = element.weather[0].description;
    const dailyIcon = document.createElement("img");
    dailyIcon.src = `https://openweathermap.org/img/wn/${element.weather[0].icon}@2x.png`;
    const dailyTemperatureCelsius = document.createElement("div");
    let dayTemp = element.temp.day;
    dailyTemperatureCelsius.textContent =
      Math.floor(dayTemp - 273.15) + " Celsius";

    daily.appendChild(dailyDate);
    daily.appendChild(dailyIcon);
    daily.appendChild(weatherDaily);
    daily.appendChild(dailyTemperatureCelsius);

    dailyWeatherContainer.appendChild(daily);
  });
}
