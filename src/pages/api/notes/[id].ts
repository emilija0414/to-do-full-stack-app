import type { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import getClient from '../../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string' || !ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'That note has an invalid ID.' });
  }

  if (req.method !== 'PATCH' && req.method !== 'DELETE') {
    res.setHeader('Allow', ['PATCH', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} is not allowed.` });
  }

  try {
    const client = await getClient();
    const db = client.db(process.env.MONGODB_DB || 'notes-app');
    const collection = db.collection('notes');
    const _id = new ObjectId(id);

    if (req.method === 'DELETE') {
      const result = await collection.deleteOne({ _id });
      if (!result.deletedCount) return res.status(404).json({ error: 'That note no longer exists.' });
      return res.status(204).end();
    }

    const { title, completed } = req.body as { title?: unknown; completed?: unknown };
    const changes: { title?: string; completed?: boolean } = {};

    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ error: 'A note needs a title.' });
      }
      changes.title = title.trim();
    }

    if (completed !== undefined) {
      if (typeof completed !== 'boolean') {
        return res.status(400).json({ error: 'The completed value must be true or false.' });
      }
      changes.completed = completed;
    }

    if (!Object.keys(changes).length) {
      return res.status(400).json({ error: 'No valid changes were provided.' });
    }

    const result = await collection.updateOne({ _id }, { $set: changes });
    if (!result.matchedCount) return res.status(404).json({ error: 'That note no longer exists.' });

    const updatedNote = await collection.findOne({ _id });
    return res.status(200).json(updatedNote);
  } catch (err) {
    console.error('Note API error:', err);
    return res.status(500).json({ error: 'Something went wrong while saving your note. Please try again.' });
  }
}
