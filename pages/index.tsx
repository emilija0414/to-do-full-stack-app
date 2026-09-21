import { useEffect, useState, type FormEvent } from 'react';

type Note = {
  _id?: string;
  id?: string;
  title: string;
  completed: boolean;
  createdAt: string;
};

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [error, setError] = useState('');

  function noteId(note: Note) {
    return note._id || note.id || '';
  }

  async function getResponseError(res: Response, fallback: string) {
    try {
      const data = await res.json();
      return typeof data.error === 'string' ? data.error : fallback;
    } catch {
      return fallback;
    }
  }

  async function load() {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/notes');
      if (!res.ok) throw new Error(await getResponseError(res, 'Could not load your notes.'));
      const data = await res.json();
      setNotes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your notes. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function addNote(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() })
      });
      if (!res.ok) throw new Error(await getResponseError(res, 'Could not add the note.'));
      const newNote = await res.json();
      setNotes((current) => [newNote, ...current]);
      setTitle('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add the note. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function startEditing(note: Note) {
    setEditingNoteId(noteId(note));
    setEditTitle(note.title);
    setError('');
  }

  function cancelEditing() {
    setEditingNoteId(null);
    setEditTitle('');
  }

  async function updateNote(id: string, changes: Partial<Pick<Note, 'title' | 'completed'>>) {
    setActiveNoteId(id);
    setError('');

    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes)
      });
      if (!res.ok) throw new Error(await getResponseError(res, 'Could not update the note.'));
      const updatedNote = await res.json();
      setNotes((current) => current.map((note) => noteId(note) === id ? updatedNote : note));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update the note. Please try again.');
      return false;
    } finally {
      setActiveNoteId(null);
    }
  }

  async function saveEdit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingNoteId || !editTitle.trim()) return;
    if (await updateNote(editingNoteId, { title: editTitle.trim() })) cancelEditing();
  }

  async function deleteNote(id: string) {
    setActiveNoteId(id);
    setError('');

    try {
      const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await getResponseError(res, 'Could not delete the note.'));
      setNotes((current) => current.filter((note) => noteId(note) !== id));
      if (editingNoteId === id) cancelEditing();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete the note. Please try again.');
    } finally {
      setActiveNoteId(null);
    }
  }

  return (
    <div className="container">
      <h1>Notes / To‑Do</h1>

      <form className="form" onSubmit={addNote}>
        <input
          type="text"
          placeholder="Write a note or todo…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit" disabled={submitting || !title.trim()}>
          {submitting ? 'Adding…' : 'Add'}
        </button>
      </form>

      {error ? <div className="error" role="alert">{error}</div> : null}

      {loading ? <p>Loading…</p> : null}

      {notes.length === 0 && !loading ? <p>No notes yet.</p> : null}

      {notes.map((n) => (
        <div className={`note${n.completed ? ' note-completed' : ''}`} key={noteId(n)}>
          {editingNoteId === noteId(n) ? (
            <form className="edit-form" onSubmit={saveEdit}>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                aria-label="Edit note"
                autoFocus
              />
              <button type="submit" disabled={activeNoteId === noteId(n) || !editTitle.trim()}>Save</button>
              <button type="button" className="secondary" onClick={cancelEditing}>Cancel</button>
            </form>
          ) : (
            <>
              <div className="note-content">
                <label className="note-title">
                  <input
                    type="checkbox"
                    checked={n.completed}
                    disabled={activeNoteId === noteId(n)}
                    onChange={() => updateNote(noteId(n), { completed: !n.completed })}
                  />
                  <span>{n.title}</span>
                </label>
                <div className="date">{new Date(n.createdAt).toLocaleString()}</div>
              </div>
              <div className="actions">
                <button type="button" className="secondary" onClick={() => startEditing(n)}>Edit</button>
                <button
                  type="button"
                  className="danger"
                  disabled={activeNoteId === noteId(n)}
                  onClick={() => deleteNote(noteId(n))}
                >
                  {activeNoteId === noteId(n) ? 'Working…' : 'Delete'}
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
