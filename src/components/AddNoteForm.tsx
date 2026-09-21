import { useState, type FormEvent } from 'react';

type AddNoteFormProps = {
  submitting: boolean;
  onAdd: (title: string) => Promise<boolean>;
};

export function AddNoteForm({ submitting, onAdd }: AddNoteFormProps) {
  const [title, setTitle] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;

    if (await onAdd(title)) {
      setTitle('');
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Write a note or todo…"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <button type="submit" disabled={submitting || !title.trim()}>
        {submitting ? 'Adding…' : 'Add'}
      </button>
    </form>
  );
}
