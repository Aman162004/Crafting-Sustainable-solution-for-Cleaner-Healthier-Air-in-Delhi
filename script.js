// This file contains the JavaScript code for the air quality monitoring web application.

// Function to fetch air quality data from the API
async function fetchAQIData() {
  try {
    const response = await fetch('https://api.example.com/aqi-data');
    const data = await response.json();

    // Update pollutant values dynamically
    document.getElementById('pm25-value').textContent = data.pm25;
    document.getElementById('pm10-value').textContent = data.pm10;
    document.getElementById('co-value').textContent = data.co;
    document.getElementById('so2-value').textContent = data.so2;
    document.getElementById('no2-value').textContent = data.no2;
    document.getElementById('o3-value').textContent = data.o3;
  } catch (error) {
    console.error('Error fetching air quality data:', error);
  }
}

// Initialize the fetch function
fetchAQIData();

// Function to fetch weather data from the API
const fetchWeatherData = async () => {
  try {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather?q=New%20Delhi&units=metric&appid=YOUR_API_KEY');
    const data = response.data;

    document.getElementById('temperature').innerText = data.main.temp;
    document.getElementById('wind-speed').innerText = data.wind.speed;
    document.getElementById('humidity').innerText = data.main.humidity;
  } catch (error) {
    console.error('Error fetching weather data:', error);
  }
};

// Initialize Fetch
fetchWeatherData();

// Function to show the selected tab content
function showTab(tabId) {
  const tabs = document.querySelectorAll('.info-card');
  tabs.forEach(tab => {
    tab.style.display = 'none';
  });
  document.getElementById(tabId).style.display = 'block';

  const buttons = document.querySelectorAll('.tab');
  buttons.forEach(button => {
    button.classList.remove('active');
  });
  event.target.classList.add('active');
}

// Initialize map and heatmap
function initHeatMap() {
  // Center map on Delhi
  const map = new google.maps.Map(document.getElementById('heatmap'), {
    zoom: 11,
    center: { lat: 28.6139, lng: 77.2090 },
    mapTypeId: 'satellite'
  });

  // Create heatmap layer
  const heatmap = new google.maps.visualization.HeatmapLayer({
    data: [],
    map: map,
    radius: 20,
    gradient: [
      'rgba(0, 255, 0, 0)',
      'rgba(0, 255, 0, 1)',    // Good (0-50)
      'rgba(255, 255, 0, 1)',  // Moderate (51-100)
      'rgba(255, 126, 0, 1)',  // Poor (101-200)
      'rgba(255, 0, 0, 1)',    // Unhealthy (201-300)
      'rgba(143, 63, 151, 1)', // Severe (301-400)
      'rgba(126, 0, 35, 1)'    // Hazardous (401+)
    ]
  });

  // Fetch and update AQI data
  async function updateHeatmapData() {
    try {
      const response = await fetch('YOUR_AQI_API_ENDPOINT');
      const data = await response.json();

      const heatmapData = data.map(point => ({
        location: new google.maps.LatLng(point.lat, point.lng),
        weight: point.aqi
      }));

      heatmap.setData(heatmapData);
    } catch (error) {
      console.error('Error fetching AQI data:', error);
    }
  }

  // Update every 5 minutes
  updateHeatmapData();
  setInterval(updateHeatmapData, 300000);
}

// Add legend control
function addLegend(map) {
  const legend = document.createElement('div');
  legend.id = 'legend';
  legend.innerHTML = `
      <h3>AQI Levels</h3>
      <div class="legend-item">
          <span style="background: #00ff00"></span>Good (0-50)
      </div>
      <div class="legend-item">
          <span style="background: #ffff00"></span>Moderate (51-100)
      </div>
      <div class="legend-item">
          <span style="background: #ff7e00"></span>Poor (101-200)
      </div>
      <div class="legend-item">
          <span style="background: #ff0000"></span>Unhealthy (201-300)
      </div>
      <div class="legend-item">
          <span style="background: #8f3f97"></span>Severe (301-400)
      </div>
      <div class="legend-item">
          <span style="background: #7e0023"></span>Hazardous (401+)
      </div>
  `;
  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(legend);
}

// Function to fetch historical AQI data
async function fetchHistoricalAQIData(period) {
  const endpoint = period === '7days'
    ? 'https://api.example.com/aqi-data/last-7-days'
    : 'https://api.example.com/aqi-data/last-month';

  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching historical AQI data:', error);
    return null;
  }
}

// Function to initialize the AQI chart
function initializeAQIChart() {
  const ctx = document.getElementById('aqiChart').getContext('2d');
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'AQI Value',
        data: [],
        borderColor: '#4CAF50',
        tension: 0.4,
        fill: false
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#fff'
          }
        },
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#fff'
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: '#fff'
          }
        }
      }
    }
  });

  document.getElementById('timeRange').addEventListener('change', async (e) => {
    const data = await fetchHistoricalAQIData(e.target.value);
    updateChart(chart, data);
  });

  // Initial load
  fetchHistoricalAQIData('7days').then(data => updateChart(chart, data));
}

// Function to update the chart with new data
function updateChart(chart, data) {
  if (!data) return;

  const labels = data.map(item => new Date(item.timestamp).toLocaleDateString());
  const values = data.map(item => item.aqi);

  chart.data.labels = labels;
  chart.data.datasets[0].data = values;
  chart.update();
}

// Initialize the AQI chart when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeAQIChart);