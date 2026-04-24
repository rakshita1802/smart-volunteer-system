const API = 'http://localhost:5000/api';

async function loadIssues() {
  const type = document.getElementById('filter-type').value;
  const status = document.getElementById('filter-status').value;
  let issues = await fetch(`${API}/issues`).then(r => r.json());
  
  if (type)   issues = issues.filter(i => i.problem_type === type);
  if (status) issues = issues.filter(i => i.status === status);

  const container = document.getElementById('issues-list');
  container.innerHTML = issues.map(issue => `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div class="card-title">${issue.title}</div>
        <span class="badge badge-${issue.status}">${issue.status}</span>
      </div>
      
      <div class="card-meta">
        <svg style="width:14px;height:14px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
        ${issue.location} 
        <span style="margin: 0 6px">•</span> 
        <svg style="width:14px;height:14px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
        ${issue.people_affected} affected
      </div>
      
      <span class="badge badge-${issue.problem_type}">${issue.problem_type}</span>
      
      <div style="margin-top: 10px; font-size: 0.85rem; color: #94a3b8; font-weight: 500;">
        Urgency Score: ${issue.urgency_score || (issue.severity * 20)}
      </div>
      
      <div class="severity">${[1,2,3,4,5].map(n =>
        `<div class="sev-dot ${n <= issue.severity ? 'filled' : ''}"></div>`
      ).join('')}</div>
      
      <div class="card-actions">
        ${issue.status === 'open' ? `<button class="btn btn-primary btn-sm" onclick="findMatches(${issue.id})">Dispatch Volunteers</button>` : ''}
        <button class="btn btn-outline btn-sm" onclick="deleteIssue(${issue.id})" style="border-color: rgba(239,68,68,0.3); color: #ef4444;">Delete</button>
      </div>
    </div>
  `).join('');
}

// Issue Submit
document.getElementById('issue-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  await fetch(`${API}/issues`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: document.getElementById('issue-title').value,
      description: document.getElementById('issue-desc').value,
      location: document.getElementById('issue-location').value,
      problem_type: document.getElementById('issue-type').value,
      severity: document.getElementById('issue-severity').value,
      people_affected: document.getElementById('issue-people').value,
    })
  });
  closeModal('add-issue-modal');
  document.getElementById('issue-form').reset();
  loadIssues();
});

// CSV Upload logic
document.getElementById('csv-file').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const res = await fetch(`${API}/upload/csv`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    alert(data.message || 'CSV Uploaded Successfully');
    closeModal('upload-modal');
    loadIssues();
  } catch (err) {
    alert('Upload failed');
  }
});

// AI OCR Image logic (using backend Gemini API)
document.getElementById('ocr-file').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const prog = document.getElementById('ocr-progress');
  prog.style.display = 'block';
  prog.innerText = 'Initializing Google Gemini AI Scanner...';
  
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    prog.innerText = 'Uploading to secure cloud API...';
    
    const res = await fetch(`${API}/ai/scan`, {
      method: 'POST',
      body: formData
    });
    
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }
    
    const result = await res.json();
    
    if (result.error) throw new Error(result.error);
    
    prog.innerText = 'Scan complete! Populating form...';
    
    const data = result.data;
    
    // Auto-fill form
    closeModal('upload-modal');
    openModal('add-issue-modal');
    
    document.getElementById('issue-title').value = data.title || "Scanned Field Report";
    document.getElementById('issue-desc').value = data.description || "No description extracted.";
    
    const validTypes = ['water', 'education', 'health', 'food', 'shelter'];
    const pType = (data.problem_type || 'other').toLowerCase();
    document.getElementById('issue-type').value = validTypes.includes(pType) ? pType : 'water';
    
    document.getElementById('issue-severity').value = data.severity || 3;
    
    prog.style.display = 'none';
    
  } catch (err) {
    console.error(err);
    prog.innerText = 'AI Scan failed. Please check the server logs or try typing manually.';
  }
});

// Volunteer Matching
async function findMatches(issueId) {
  const data = await fetch(`${API}/match/${issueId}`).then(r => r.json());
  const container = document.getElementById('match-results');
  container.innerHTML = `<p style="margin-bottom:1rem;color:#94a3b8;font-size:0.9rem">Dispatching for: <strong>${data.issue.title}</strong></p>` +
    data.matches.map(v => `
      <div class="card" style="margin-bottom:1rem; padding: 1rem;">
        <div style="display:flex;justify-content:space-between; align-items:center;">
          <div class="card-title" style="margin:0;">${v.name}</div>
          <strong style="color:var(--primary-light); font-size:1.1rem">${v.score}% Match</strong>
        </div>
        <div class="card-meta" style="margin: 0.5rem 0;">${v.location} · ${v.skills?.join(', ')}</div>
        
        <div class="score-bar-wrap"><div class="score-bar" style="width:${v.score}%"></div></div>
        
        <div style="font-size:0.8rem;color:#94a3b8;margin-top:6px; display:flex; justify-content:space-between;">
          <span>Skill: ${v.skill_score}%</span>
          <span>Proximity: ${v.proximity_score}%</span>
        </div>
        
        <button class="btn btn-success btn-sm full-width" style="margin-top:1rem"
          onclick="assignVolunteer(${data.issue.id}, ${v.id})">
          Assign & Notify
        </button>
      </div>
    `).join('');
  openModal('match-modal');
}

async function assignVolunteer(issueId, volunteerId) {
  await fetch(`${API}/match/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ issue_id: issueId, volunteer_id: volunteerId })
  });
  closeModal('match-modal');
  loadIssues();
  
  // Fake notification toast
  const toast = document.createElement('div');
  toast.style.cssText = 'position:fixed; bottom:20px; right:20px; background:var(--success); color:white; padding:1rem 1.5rem; border-radius:8px; z-index:1000; box-shadow:0 10px 15px -3px rgba(0,0,0,0.3); font-weight:600; animation:fadeIn 0.3s;';
  toast.innerText = '✓ Volunteer successfully dispatched!';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

async function deleteIssue(id) {
  if (!confirm('Are you sure you want to delete this issue?')) return;
  await fetch(`${API}/issues/${id}`, { method: 'DELETE' });
  loadIssues();
}

// Modal utilities
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

loadIssues();