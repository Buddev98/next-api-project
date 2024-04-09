import { connectDatabase, insertDocument, getAllDocuments } from '../../../helpers/db-utils';

export default async function handler(req, res) {
  const eventId = req.query.eventId;

  let client;

  try {
    client = await connectDatabase();
  } catch (error) {
    res.status(500).json({ message: 'Connecting to the database failed!'});
    return;
  }

  if (req.method === 'POST') {
    //add server side validation
    const { email, name, comment } = req.body;
    if (
      !email.includes('@') ||
      !name ||
      name.trim() === '' ||
      !comment ||
      comment.trim() === ''
    ) {
      res.status(422).json({ error: 'Invalid Input' });
      client.close();
      return;
    }

    const newComment = {
      email,
      name,
      comment,
      eventId,
    };

    let result;

    try {
      result = await insertDocument(client, 'comments', newComment);
      newComment._id = result.insertedId;
      res.status(201).json({ message: 'Comment added', comment: newComment });
    } catch (error) {
      res.status(500).json({ message: 'Inserting comment failed'});
      return;
    }

    
  }

  if (req.method === 'GET') {
    // const dummyList = [
    //   { id: 'c1', name: 'Max', comment: 'first comment' },
    //   { id: 'c2', name: 'Josh', comment: 'second comment' }
    // ];

    try {
      const documents = await getAllDocuments(client, 'comments', { _id: -1 });
      res.status(200).json({ comments: documents });
    } catch (error) {
      res.status(500).json({ message: 'Getting comments failed'});
      return;
    }
   
  }

  client.close();
}
