const express = require('express');
const app = express();
const summarizeRoute = require('./routes/summarize');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { extractText } = require('./services/ocrService');
const cors = require('cors');

app.use(bodyParser.json());
app.use('/api', summarizeRoute);
app.use(cors()); // Enable CORS for all origins

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// OCR endpoint
app.post('/ocr', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    try {
        const filePath = path.resolve(req.file.path);
        const text = await extractText(filePath);
        // Optionally delete the file after OCR
        fs.unlink(filePath, () => {});
        res.json({ text });
    } catch (err) {
        res.status(500).json({ error: 'OCR failed', details: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
