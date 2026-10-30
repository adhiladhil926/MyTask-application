import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const emptyForm = { title: '', description: '', due_date: '', status: 'Pending' };
const statuses = ['Pending', 'In progress', 'Completed'];

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function loadTasks() {
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data);
    } catch (error) {
      setError(error.message || 'Could not load tasks.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, [user.id]);

  function changeField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  async function saveTask(event) {
    event.preventDefault();
    if (busy) return;

    if (!form.title.trim()) {
      setError('Please enter a task title.');
      return;
    }

    setBusy(true);
    setError('');

    const task = {
      title: form.title.trim(),
      description: form.description.trim(),
      due_date: form.due_date || null,
      status: form.status
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from('tasks')
          .update(task)
          .eq('id', editingId)
          .eq('user_id', user.id)
          .select('id')
          .single();

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tasks')
          .insert({ ...task, user_id: user.id });

        if (error) throw error;
      }

      resetForm();
      await loadTasks();
    } catch (error) {
      setError(error.message || 'Could not save the task.');
    } finally {
      setBusy(false);
    }
  }

  function editTask(task) {
    setEditingId(task.id);
    setForm({
      title: task.title,
      description: task.description,
      due_date: task.due_date || '',
      status: task.status
    });
    document.getElementById('task-title').focus();
  }

  async function deleteTask(task) {
    if (busy) return;
    if (!window.confirm('Delete "' + task.title + '"?')) return;

    setBusy(true);
    setError('');

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id)
        .eq('user_id', user.id)
        .select('id')
        .single();

      if (error) throw error;
      if (editingId === task.id) resetForm();
      await loadTasks();
    } catch (error) {
      setError(error.message || 'Could not delete the task.');
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    setError('');

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      setError(error.message || 'Could not log out.');
    } finally {
      setBusy(false);
    }
  }

  let visibleTasks = tasks;
  if (filter !== 'All') {
    visibleTasks = tasks.filter(task => task.status === filter);
  }

  const pendingCount = tasks.filter(task => task.status === 'Pending').length;
  const completedCount = tasks.filter(task => task.status === 'Completed').length;

  return (
    <div className="dashboard">
      <header className="topbar">
        <span className="brand">My Tasks<span className="brand-dot">.</span></span>
        <div className="account">
          <span>{user.email}</span>
          <button className="secondary" disabled={busy} onClick={logout}>Log out</button>
        </div>
      </header>

      <main className="container">
        <p className="small-heading">YOUR PERSONAL PLANNER</p>
        <h1>Hello, {user.user_metadata?.full_name || 'there'}!</h1>
        <p className="muted">Keep your day simple. One task at a time.</p>

        <section className="stats" aria-label="Task summary">
          <div className="card"><span>Total tasks</span><strong>{tasks.length}</strong></div>
          <div className="card"><span>Pending</span><strong>{pendingCount}</strong></div>
          <div className="card"><span>Completed</span><strong>{completedCount}</strong></div>
        </section>

        {error && (
          <div className="error" role="alert">
            {error}
            <button className="text-button" disabled={loading || busy} onClick={loadTasks}>
              Reload tasks
            </button>
          </div>
        )}

        <div className="workspace">
          <section className="card task-form">
            <h2>{editingId ? 'Edit task' : 'Add a task'}</h2>
            <p className="muted">What would you like to get done?</p>

            <form onSubmit={saveTask}>
              <fieldset disabled={busy || loading}>
                <label htmlFor="task-title">
                  Title
                  <input
                    id="task-title"
                    name="title"
                    value={form.title}
                    onChange={changeField}
                    placeholder="e.g. Prepare for interview"
                    maxLength={120}
                    required
                  />
                </label>

                <label>
                  Description
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={changeField}
                    placeholder="Add a few details (optional)"
                    rows={3}
                    maxLength={2000}
                  />
                </label>

                <label>
                  Due date
                  <input type="date" name="due_date" value={form.due_date} onChange={changeField} />
                </label>

                <label>
                  Status
                  <select name="status" value={form.status} onChange={changeField}>
                    {statuses.map(status => <option key={status}>{status}</option>)}
                  </select>
                </label>

                <div className="actions">
                  <button type="submit">{editingId ? 'Save changes' : 'Add task'}</button>
                  {editingId && (
                    <button type="button" className="secondary" onClick={resetForm}>Cancel</button>
                  )}
                </div>
                {busy && <p role="status">Please wait...</p>}
              </fieldset>
            </form>
          </section>

          <section className="card task-list">
            <div className="list-heading">
              <h2>Your tasks</h2>
              <label className="filter">
                Show
                <select value={filter} onChange={event => setFilter(event.target.value)}>
                  <option>All</option>
                  {statuses.map(status => <option key={status}>{status}</option>)}
                </select>
              </label>
            </div>

            {loading && <p role="status" className="empty">Loading your tasks...</p>}

            {!loading && visibleTasks.length === 0 && (
              <p className="empty">No tasks to show.</p>
            )}

            {!loading && (
              <ul className="tasks">
                {visibleTasks.map(task => (
                  <li key={task.id}>
                    <div className="task-heading">
                      <h3>{task.title}</h3>
                      <span className={'badge ' + task.status.toLowerCase().replace(' ', '-')}>
                        {task.status}
                      </span>
                    </div>

                    {task.description && <p className="description">{task.description}</p>}

                    <div className="task-bottom">
                      <span className="muted">
                        {task.due_date ? 'Due ' + task.due_date : 'No due date'}
                      </span>
                      <div className="actions">
                        <button className="text-button" onClick={() => editTask(task)} disabled={busy} aria-label={'Edit ' + task.title}>
                          Edit
                        </button>
                        <button className="text-button danger" onClick={() => deleteTask(task)} disabled={busy} aria-label={'Delete ' + task.title}>
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
