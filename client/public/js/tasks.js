const API = '/api';

async function loadTasks() {
  const tasks = await fetch(`${API}/tasks`).then(r => r.json());
  ['pending', 'in_progress', 'completed'].forEach(status => {
    const col = document.getElementById(`col-${status}`);
    const filtered = tasks.filter(t => t.status === status);
    col.innerHTML = filtered.length === 0
      ? `<p style="font-size:0.8rem;color:#94a3b8">No tasks</p>`
      : filtered.map(t => `
          <div class="kanban-card">
            <div class="card-title">${t.title}</div>
            <div class="card-meta" style="margin-top:4px">${t.issue_title || '—'}</div>
            <div class="card-meta">Volunteer: ${t.volunteer_name || 'Unassigned'}</div>
            <div class="card-actions" style="margin-top:0.75rem">
              ${status === 'pending'      ? `<button class="btn btn-primary btn-sm" onclick="updateStatus(${t.id},'in_progress')">Start</button>` : ''}
              ${status === 'in_progress'  ? `<button class="btn btn-success btn-sm" onclick="updateStatus(${t.id},'completed')">Complete</button>` : ''}
              <button class="btn btn-danger btn-sm" onclick="deleteTask(${t.id})">Delete</button>
            </div>
          </div>
        `).join('');
  });
}

async function updateStatus(id, status) {
  await fetch(`${API}/tasks/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  loadTasks();
}

async function deleteTask(id) {
  if (!confirm('Delete this task?')) return;
  await fetch(`${API}/tasks/${id}`, { method: 'DELETE' });
  loadTasks();
}

loadTasks();