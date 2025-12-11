// --- CONFIGURATION ---
const KEYS = {
    NEWS: "03648588-df3c-4897-91f0-fd496e5a829c",
    WEATHER: "7d1b3087cd2544b985a50400250912"
};

// --- DOM ELEMENTS ---
const newsGrid = document.getElementById('news-grid');
const heroContainer = document.getElementById('hero-container');
const searchInput = document.getElementById('search-input');
const sectionTitle = document.getElementById('section-title');
const weatherModal = document.getElementById('weather-modal');
const wInput = document.getElementById('w-input');
const wBtn = document.getElementById('w-btn');

// --- INIT ---
window.addEventListener('load', () => {
    fetchNews("");
    const savedCity = localStorage.getItem("lastCity");
    if(savedCity) fetchWeather(savedCity);
});

// --- NEWS LOGIC ---
document.getElementById('search-btn').addEventListener("click", () => fetchNews(searchInput.value));
searchInput.addEventListener("keypress", (e) => { if(e.key === "Enter") fetchNews(searchInput.value); });

function handleCategoryClick(cat) {
    searchInput.value = cat;
    fetchNews(cat);
}

async function fetchNews(query) {
    sectionTitle.textContent = query ? `Results: ${query}` : "Top Stories";
    heroContainer.innerHTML = "";
    newsGrid.innerHTML = ""; // Clear existing

    try {
        let url = `https://content.guardianapis.com/search?api-key=${KEYS.NEWS}&show-fields=thumbnail&page-size=13`;
        if (query) url += `&q=${encodeURIComponent(query)}`;

        const res = await fetch(url);
        const data = await res.json();
        renderNews(data.response.results);
    } catch (e) {
        console.error(e);
        sectionTitle.textContent = "Error loading news.";
    }
}

function renderNews(articles) {
    if (!articles.length) { sectionTitle.textContent = "No news found."; return; }

    articles.forEach((art, idx) => {
        const img = art.fields?.thumbnail || "https://via.placeholder.com/800x400";
        if (idx === 0) {
            heroContainer.innerHTML = `
                <div class="hero-card">
                    <img class="hero-img" src="${img}">
                    <div class="hero-content">
                        <p class="section-tag">${art.sectionName}</p>
                        <a href="${art.webUrl}" target="_blank" class="hero-title">${art.webTitle}</a>
                    </div>
                </div>`;
        } else {
            newsGrid.innerHTML += `
                <article class="card">
                    <img class="card-img" src="${img}">
                    <div class="card-body">
                        <p class="section-tag">${art.sectionName}</p>
                        <a href="${art.webUrl}" target="_blank" class="card-title">${art.webTitle}</a>
                    </div>
                </article>`;
        }
    });
}

// --- WEATHER LOGIC ---
function toggleWeatherModal() {
    const isHidden = getComputedStyle(weatherModal).display === "none";
    weatherModal.style.display = isHidden ? "flex" : "none";
}

wBtn.addEventListener("click", () => fetchWeather(wInput.value));
wInput.addEventListener("keypress", (e) => { if(e.key === "Enter") fetchWeather(wInput.value); });

async function fetchWeather(city) {
    if(!city) return;
    wBtn.textContent = "...";
    
    try {
        const res = await fetch(`https://api.weatherapi.com/v1/current.json?key=${KEYS.WEATHER}&q=${city}&aqi=yes`);
        if(!res.ok) throw new Error("City not found");
        
        const data = await res.json();
        updateWeatherUI(data);
        localStorage.setItem("lastCity", city);
        wBtn.textContent = "Check";
    } catch (e) {
        wBtn.textContent = "Error";
        setTimeout(() => wBtn.textContent = "Check", 2000);
    }
}

function updateWeatherUI(data) {
    const { location: loc, current: curr } = data;
    const aqi = curr.air_quality;
    searchInput.value = "";

    document.getElementById('cityid').textContent = loc.name;
    document.getElementById('regionid').textContent = `${loc.region}, ${loc.country}`;
    document.getElementById('timeid').textContent = loc.localtime;
    
    document.getElementById('tempid').textContent = `${curr.temp_c}°`;
    document.getElementById('textid').textContent = curr.condition.text;
    document.getElementById('imgid').src = "https:" + curr.condition.icon;

    document.getElementById('wind_kphid').textContent = `${curr.wind_kph} km/h`;
    document.getElementById('wind_dirid').textContent = `Direction: ${curr.wind_dir}`;
    document.getElementById('humidityid').textContent = `${curr.humidity}%`;
    document.getElementById('pressureid').textContent = `${curr.pressure_mb} mb`;
    
    document.getElementById('aqi-badge').textContent = `Index: ${aqi['us-epa-index']}`;
    document.getElementById('pm25id').textContent = aqi.pm2_5.toFixed(1);
}