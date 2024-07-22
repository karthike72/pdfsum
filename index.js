app.post('/processpdf', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded.' });
    }

    const filePath = path.join(__dirname, req.file.path);

    // Extract the original file name without extension
    const originalName = path.parse(req.file.originalname).name;
    const outputFileName = `${originalName}-converted.pdf`;
    const outputPath = path.join(__dirname, 'uploads', outputFileName);

    fs.readFile(filePath, (err, fileBuffer) => {
        if (err) {
            console.error(`Error reading file: ${err.message}`);
            return res.status(500).json({ success: false, error: 'Error reading file.' });
        }

        libre.convert(fileBuffer, '.pdf', undefined, (err, done) => {
            if (err) {
                console.error(`Error converting file: ${err.message}`);
                return res.status(500).json({ success: false, error: 'Error converting file.' });
            }

            fs.writeFile(outputPath, done, (err) => {
                if (err) {
                    console.error(`Error saving converted file: ${err.message}`);
                    return res.status(500).json({ success: false, error: 'Error saving converted file.' });
                }

                // Send a response with the download URL
                res.json({ success: true, downloadUrl: `/uploads/${outputFileName}` });

                // Clean up temporary files
                fs.unlink(filePath, (unlinkErr) => {
                    if (unlinkErr) {
                        console.error(`Error deleting uploaded file: ${unlinkErr.message}`);
                    }
                });
            });
        });
    });
});