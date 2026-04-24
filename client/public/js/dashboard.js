const API = 'http://localhost:5000/api';

async function loadDashboard() {
  const [issues, volunteers, tasks] = await Promise.all([
    fetch(`${API}/issues`).then(r => r.json()),
    fetch(`${API}/volunteers`).then(r => r.json()),
    fetch(`${API}/tasks`).then(r => r.json()),
  ]);

  document.getElementById('total-issues').textContent = issues.length;
  document.getElementById('open-issues').textContent = issues.filter(i => i.status === 'open').length;
  document.getElementById('total-volunteers').textContent = volunteers.length;
  document.getElementById('tasks-completed').textContent = tasks.filter(t => t.status === 'completed').length;

  // Issues by type (pie)
  const typeCounts = {};
  issues.forEach(i => { typeCounts[i.problem_type] = (typeCounts[i.problem_type] || 0) + 1; });
  new Chart(document.getElementById('typeChart'), {
    type: 'doughnut',
    data: {
      labels: Object.keys(typeCounts),
      datasets: [{ data: Object.values(typeCounts), backgroundColor: ['#3b82f6','#ef4444','#f59e0b','#10b981','#8b5cf6'] }]
    },
    options: { plugins: { legend: { position: 'bottom' } } }
  });

  // Issues by area (bar)
  const areaCounts = {};
  issues.forEach(i => { areaCounts[i.location] = (areaCounts[i.location] || 0) + 1; });
  new Chart(document.getElementById('areaChart'), {
    type: 'bar',
    data: {
      labels: Object.keys(areaCounts),
      datasets: [{ label: 'Issues', data: Object.values(areaCounts), backgroundColor: '#3b82f6' }]
    },
    options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
  });

  // Critical issues list
  const critical = issues.filter(i => i.severity >= 4 && i.status !== 'resolved').slice(0, 5);
  const container = document.getElementById('critical-issues');
  container.innerHTML = critical.map(i => `
    <div class="issue-row">
      <span>${i.title} — <span class="badge badge-${i.problem_type}">${i.problem_type}</span></span>
      <span class="badge badge-${i.status}">${i.status}</span>
    </div>
  `).join('');
}

loadDashboard();