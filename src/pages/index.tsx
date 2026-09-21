import { AddNoteForm } from '../components/AddNoteForm';
import { NoteItem } from '../components/NoteItem';
import { useNotes } from '../hooks/useNotes';
import { getNoteId } from '../types/note';

export default function Home() {
  const {
    notes,
    loading,
    submitting,
    activeNoteId,
    error,
    addNote,
    updateNote,
    deleteNote
  } = useNotes();

  return (
    <div className="container">
      <h1>Notes / To‑Do</h1>

      <AddNoteForm submitting={submitting} onAdd={addNote} />

      {error ? <div className="error" role="alert">{error}</div> : null}
      {loading ? <p>Loading…</p> : null}
      {notes.length === 0 && !loading ? <p>No notes yet.</p> : null}

      {notes.map((note) => {
        const id = getNoteId(note);

        return (
          <NoteItem
            key={id}
            note={note}
            busy={activeNoteId === id}
            onUpdate={updateNote}
            onDelete={deleteNote}
          />
        );
      })}
    </div>
  );
}
