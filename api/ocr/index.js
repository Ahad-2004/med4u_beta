// Vercel Serverless Function for OCR using Tesseract.js
import { createWorker } from 'tesseract.js';

export const config = {
  api: {
    bodyParser: false, // We'll handle file upload manually
  },
};

import formidable from 'formidable';
import fs from 'fs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Parse the uploaded file
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(400).json({ error: 'Error parsing file upload' });
      return;
    }
    const file = files.file;
    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }
    try {
      const worker = await createWorker('eng');
      const {
        data: { text },
      } = await worker.recognize(fs.createReadStream(file.filepath));
      await worker.terminate();
      res.status(200).json({ text });
    } catch (ocrError) {
      res.status(500).json({ error: 'OCR failed', details: ocrError.message });
    }
  });
}
