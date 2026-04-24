const API = 'http://localhost:5000/api';

async function loadVolunteers() {
  const volunteers = await fetch(`${API}/volunteers`).then(r => r.json());
  const container = document.getElementById('volunteers-list');
  container.innerHTML = volunteers.map(v => `
    <div class="card">
      <div class="card-title">${v.name}</div>
      <div class="card-meta">
        <svg style="width:14px;height:14px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
        ${v.email}
      </div>
      <div class="card-meta" style="margin-bottom: 1rem;">
        <svg style="width:14px;height:14px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
        ${v.location} · <span style="color:var(--success)">${v.availability}</span>
      </div>
      <div style="margin-top:0.5rem;display:flex;flex-wrap:wrap;gap:6px">
        ${(v.skills || []).map(s => `<span class="badge badge-water" style="background:rgba(255,255,255,0.1); border-color:rgba(255,255,255,0.2); color:#e2e8f0">${s}</span>`).join('')}
      </div>
      <div class="card-actions" style="margin-top: 1.5rem;">
        <button class="btn btn-outline btn-sm full-width" onclick="removeVolunteer(${v.id})" style="border-color: rgba(239,68,68,0.3); color: #ef4444;">Remove</button>
      </div>
    </div>
  `).join('');
}

document.getElementById('volunteer-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  await fetch(`${API}/volunteers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: document.getElementById('vol-name').value,
      email: document.getElementById('vol-email').value,
      phone: document.getElementById('vol-phone').value,
      location: document.getElementById('vol-location').value,
      skills: document.getElementById('vol-skills').value,
      availability: document.getElementById('vol-availability').value,
    })
  });
  closeModal('add-volunteer-modal');
  document.getElementById('volunteer-form').reset();
  loadVolunteers();
});

async function removeVolunteer(id) {
  if (!confirm('Remove this volunteer?')) return;
  await fetch(`${API}/volunteers/${id}`, { method: 'DELETE' });
  loadVolunteers();
}

function openModal(id) {
  document.getElementById(id).classList.add('show');
  document.getElementById('overlay').classList.add('show');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('show');
  document.getElementById('overlay').classList.remove('show');
}
function closeAllModals() {
  document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
  document.getElementById('overlay').classList.remove('show');
}

loadVolunteers();