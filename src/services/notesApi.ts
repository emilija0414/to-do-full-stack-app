import type { Note, NoteChanges } from '../types/note';

const notesEndpoint = '/api/notes';

async function getResponseError(response: Response, fallback: string) {
  try {
    const data = await response.json();
    return typeof data.error === 'string' ? data.error : fallback;
  } catch {
    return fallback;
  }
}

async function requireSuccessfulResponse(response: Response, fallback: string) {
  if (!response.ok) {
    throw new Error(await getResponseError(response, fallback));
  }
}

export async function fetchNotes(): Promise<Note[]> {
  const response = await fetch(notesEndpoint);
  await requireSuccessfulResponse(response, 'Could not load your notes.');

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function createNote(title: string): Promise<Note> {
  const response = await fetch(notesEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  });

  await requireSuccessfulResponse(response, 'Could not add the note.');
  return response.json();
}

export async function patchNote(id: string, changes: NoteChanges): Promise<Note> {
  const response = await fetch(`${notesEndpoint}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(changes)
  });

  await requireSuccessfulResponse(response, 'Could not update the note.');
  return response.json();
}

export async function removeNote(id: string): Promise<void> {
  const response = await fetch(`${notesEndpoint}/${id}`, { method: 'DELETE' });
  await requireSuccessfulResponse(response, 'Could not delete the note.');
}
