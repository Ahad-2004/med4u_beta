const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');

router.post('/summarize', (req, res) => {
    const inputText = req.body.text;

    const python = spawn('python', ['routes/summarizer.py']);

    let summary = '';
    python.stdout.on('data', (data) => {
        summary += data.toString();
    });

    python.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    python.on('close', (code) => {
        if (code !== 0) {
            return res.status(500).send('Summarization failed');
        }
        res.send({ summary });
    });

    python.stdin.write(inputText);
    python.stdin.end();
});

module.exports = router;
