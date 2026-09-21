import { useCallback, useEffect, useState } from 'react';
import { createNote, fetchNotes, patchNote, removeNote } from '@/services/notesApi';
import { getNoteId, type Note, type NoteChanges } from '@/types/note';

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadNotes = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      setNotes(await fetchNotes());
    } catch (requestError) {
      setError(errorMessage(requestError, 'Could not load your notes. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotes();
  }, [loadNotes]);

  async function addNote(title: string) {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return false;

    setSubmitting(true);
    setError('');

    try {
      const newNote = await createNote(trimmedTitle);
      setNotes((current) => [newNote, ...current]);
      return true;
    } catch (requestError) {
      setError(errorMessage(requestError, 'Could not add the note. Please try again.'));
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function updateNote(id: string, changes: NoteChanges) {
    setActiveNoteId(id);
    setError('');

    try {
      const updatedNote = await patchNote(id, changes);
      setNotes((current) => current.map((note) => getNoteId(note) === id ? updatedNote : note));
      return true;
    } catch (requestError) {
      setError(errorMessage(requestError, 'Could not update the note. Please try again.'));
      return false;
    } finally {
      setActiveNoteId(null);
    }
  }

  async function deleteNote(id: string) {
    setActiveNoteId(id);
    setError('');

    try {
      await removeNote(id);
      setNotes((current) => current.filter((note) => getNoteId(note) !== id));
    } catch (requestError) {
      setError(errorMessage(requestError, 'Could not delete the note. Please try again.'));
    } finally {
      setActiveNoteId(null);
    }
  }

  return {
    notes,
    loading,
    submitting,
    activeNoteId,
    error,
    addNote,
    updateNote,
    deleteNote
  };
}
