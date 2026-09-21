export type Note = {
  _id?: string;
  id?: string;
  title: string;
  completed: boolean;
  createdAt: string;
};

export type NoteChanges = Partial<Pick<Note, 'title' | 'completed'>>;

export function getNoteId(note: Note) {
  return note._id || note.id || '';
}
