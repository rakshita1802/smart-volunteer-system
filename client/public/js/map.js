const API = '/api';

// Geocoding cache or mock coordinates for locations (since the app uses string locations)
const mockGeo = {
  'New York': [40.7128, -74.0060],
  'Los Angeles': [34.0522, -118.2437],
  'Chicago': [41.8781, -87.6298],
  'Houston': [29.7604, -95.3698],
  'Phoenix': [33.4484, -112.0740],
  'San Francisco': [37.7749, -122.4194],
  'Seattle': [47.6062, -122.3321],
  'Austin': [30.2672, -97.7431]
};

// Fallback randomizer for unknown cities near center
function getRandomGeo(baseLat = 39.8283, baseLng = -98.5795) {
  return [baseLat + (Math.random() * 10 - 5), baseLng + (Math.random() * 20 - 10)];
}

let map;

async function initMap() {
  // Center roughly on US
  map = L.map('impact-map').setView([39.8283, -98.5795], 4);

  // Add dark themed tiles (CartoDB Dark Matter)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map);

  // Fetch issues
  const issues = await fetch(`${API}/issues`).then(r => r.json());

  // Plot each open/assigned issue
  issues.forEach(issue => plotIssue(issue));
}

function plotIssue(issue) {
  if (issue.status === 'resolved') return; // optionally skip resolved

  let coords = mockGeo[issue.location];
  if (!coords) {
    coords = getRandomGeo();
    mockGeo[issue.location] = coords;
  }

  // Add slight offset so markers don't overlap perfectly
  const lat = coords[0] + (Math.random() * 0.02 - 0.01);
  const lng = coords[1] + (Math.random() * 0.02 - 0.01);

  // Determine color based on severity (1-5) and urgency
  let color = '#10b981'; // Green (Low)
  if (issue.severity >= 4) color = '#ef4444'; // Red (High)
  else if (issue.severity === 3) color = '#f59e0b'; // Yellow (Medium)

  // Create a custom circle marker
  const marker = L.circleMarker([lat, lng], {
    radius: 8 + (issue.severity * 2), // Size based on severity
    fillColor: color,
    color: '#fff',
    weight: 2,
    opacity: 1,
    fillOpacity: 0.7
  }).addTo(map);

  // Popup content
  const popupContent = `
    <div>
      <h4>${issue.title}</h4>
      <p>${issue.location} • Severity: ${issue.severity}/5</p>
      <div style="margin-bottom: 10px;">
        <span class="badge badge-${issue.problem_type}" style="display:inline-block; margin-right:5px;">${issue.problem_type}</span>
        <span class="badge badge-${issue.status}" style="display:inline-block;">${issue.status}</span>
      </div>
      <p style="font-size: 0.8rem;">People affected: ${issue.people_affected}</p>
      <p style="font-size: 0.8rem; color:#cbd5e1;">${issue.description || 'No description provided.'}</p>
    </div>
  `;

  marker.bindPopup(popupContent);
}

// ⚡ Real-Time Socket.io Connection ⚡
if (typeof io !== 'undefined') {
  const socket = io();
  socket.on('new_issue', (issue) => {
    // Drop pin instantly without refreshing
    plotIssue(issue);
    
    // Show toast
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed; top:20px; left:50%; transform:translateX(-50%); background:var(--danger); color:white; padding:1rem 1.5rem; border-radius:99px; z-index:1000; box-shadow:0 10px 25px rgba(0,0,0,0.5); font-weight:700; animation:fadeInDown 0.5s;';
    toast.innerText = `🚨 LIVE UPDATE: New ${issue.problem_type.toUpperCase()} crisis in ${issue.location}!`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
  });
}

document.addEventListener('DOMContentLoaded', initMap);
