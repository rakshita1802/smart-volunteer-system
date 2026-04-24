const API = 'http://localhost:5000/api';

function showTab(tabId, btn) {
  document.querySelectorAll('.tab-content').forEach(t => { t.style.display = 'none'; t.classList.add('hidden'); });
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  
  const el = document.getElementById(tabId);
  el.classList.remove('hidden');
  el.style.display = 'block';
  
  if (btn) btn.classList.add('active');
}

async function loadAdmin() {
  const [issues, volunteers, tasks] = await Promise.all([
    fetch(`${API}/issues`).then(r => r.json()),
    fetch(`${API}/volunteers`).then(r => r.json()),
    fetch(`${API}/tasks`).then(r => r.json()),
  ]);

  document.getElementById('admin-issues-body').innerHTML = issues.map(i => `
    <tr>
      <td>${i.id}</td>
      <td>${i.title}</td>
      <td>${i.location}</td>
      <td><span class="badge badge-${i.problem_type}">${i.problem_type}</span></td>
      <td>${'★'.repeat(i.severity)}</td>
      <td><span class="badge badge-${i.status}">${i.status}</span></td>
      <td><button class="btn btn-danger btn-sm" onclick="adminDelete('issues',${i.id})">Delete</button></td>
    </tr>
  `).join('');

  document.getElementById('admin-volunteers-body').innerHTML = volunteers.map(v => `
    <tr>
      <td>${v.id}</td>
      <td>${v.name}</td>
      <td>${v.email}</td>
      <td>${v.location}</td>
      <td>${(v.skills || []).join(', ')}</td>
      <td>${v.availability}</td>
      <td><button class="btn btn-danger btn-sm" onclick="adminDelete('volunteers',${v.id})">Remove</button></td>
    </tr>
  `).join('');

  document.getElementById('admin-tasks-body').innerHTML = tasks.map(t => `
    <tr>
      <td>${t.id}</td>
      <td>${t.title}</td>
      <td>${t.issue_title || '—'}</td>
      <td>${t.volunteer_name || 'Unassigned'}</td>
      <td><span class="badge badge-${t.status}">${t.status}</span></td>
      <td><button class="btn btn-danger btn-sm" onclick="adminDelete('tasks',${t.id})">Delete</button></td>
    </tr>
  `).join('');
}

async function adminDelete(resource, id) {
  if (!confirm(`Delete this ${resource.slice(0,-1)}?`)) return;
  await fetch(`${API}/${resource}/${id}`, { method: 'DELETE' });
  loadAdmin();
}

loadAdmin();