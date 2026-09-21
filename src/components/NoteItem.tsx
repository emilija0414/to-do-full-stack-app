import { useState, type FormEvent } from 'react';
import { getNoteId, type Note, type NoteChanges } from '../types/note';

type NoteItemProps = {
  note: Note;
  busy: boolean;
  onUpdate: (id: string, changes: NoteChanges) => Promise<boolean>;
  onDelete: (id: string) => Promise<void>;
};

export function NoteItem({ note, busy, onUpdate, onDelete }: NoteItemProps) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const id = getNoteId(note);

  function startEditing() {
    setEditTitle(note.title);
    setEditing(true);
  }

  function cancelEditing() {
    setEditTitle(note.title);
    setEditing(false);
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = editTitle.trim();
    if (!title) return;

    if (await onUpdate(id, { title })) {
      setEditing(false);
    }
  }

  if (editing) {
    return (
      <div className={`note${note.completed ? ' note-completed' : ''}`}>
        <form className="edit-form" onSubmit={saveEdit}>
          <input
            type="text"
            value={editTitle}
            onChange={(event) => setEditTitle(event.target.value)}
            aria-label="Edit note"
            autoFocus
          />
          <button type="submit" disabled={busy || !editTitle.trim()}>Save</button>
          <button type="button" className="secondary" onClick={cancelEditing}>Cancel</button>
        </form>
      </div>
    );
  }

  return (
    <div className={`note${note.completed ? ' note-completed' : ''}`}>
      <div className="note-content">
        <label className="note-title">
          <input
            type="checkbox"
            checked={note.completed}
            disabled={busy}
            onChange={() => { void onUpdate(id, { completed: !note.completed }); }}
          />
          <span>{note.title}</span>
        </label>
        <div className="date">{new Date(note.createdAt).toLocaleString()}</div>
      </div>
      <div className="actions">
        <button type="button" className="secondary" disabled={busy} onClick={startEditing}>Edit</button>
        <button
          type="button"
          className="danger"
          disabled={busy}
          onClick={() => { void onDelete(id); }}
        >
          {busy ? 'Working…' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
