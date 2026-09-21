import type { NextApiRequest, NextApiResponse } from 'next';
import getClient from '../../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const client = await getClient();
      const db = client.db(process.env.MONGODB_DB || 'notes-app');
      const collection = db.collection('notes');
      const notes = await collection.find({}).sort({ createdAt: -1 }).toArray();
      res.status(200).json(notes);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
      res.status(500).json({ error: 'Could not load your notes. Please try again.' });
    }
  } else if (req.method === 'POST') {
    try {
      const { title } = req.body as { title?: unknown };
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ error: 'Please enter a note before adding it.' });
      }
      const client = await getClient();
      const db = client.db(process.env.MONGODB_DB || 'notes-app');
      const collection = db.collection('notes');
      const note = { title: title.trim(), completed: false, createdAt: new Date() };
      const result = await collection.insertOne(note);
      res.status(201).json({ ...note, _id: result.insertedId });
    } catch (err) {
      console.error('Failed to create note:', err);
      res.status(500).json({ error: 'Could not add your note. Please try again.' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: `Method ${req.method} is not allowed.` });
  }
}
