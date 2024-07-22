const express = require('express');
const multer = require('multer');
const libre = require('libreoffice-convert');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html on root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle PDF processing
app.post('/processpdf', upload.single('file'), (req, res) => {
    const filePath = path.join(__dirname, req.file.path);

    // Extract the original file name without extension
    const originalName = path.parse(req.file.originalname).name;
    const outputFileName = `${originalName}-converted.pdf`;
    const outputPath = path.join(__dirname, `uploads/${outputFileName}`);

    // Read the file and convert it to PDF
    const fileBuffer = fs.readFileSync(filePath);
    const fileUint8Array = new Uint8Array(fileBuffer);

    libre.convert(fileUint8Array, '.pdf', undefined, (err, done) => {
        if (err) {
            console.error(`Error converting file: ${err}`);
            return res.status(500).send('Error processing file');
        }

        fs.writeFileSync(outputPath, done);

        // Send the converted file
        res.download(outputPath, outputFileName, (err) => {
            if (err) {
                console.error(`Error sending file: ${err}`);
                res.status(500).send('Error sending file');
            }

            // Clean up temporary files
            fs.unlink(filePath, () => {}); // Delete uploaded file
            fs.unlink(outputPath, () => {}); // Delete converted PDF
        });
    });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});