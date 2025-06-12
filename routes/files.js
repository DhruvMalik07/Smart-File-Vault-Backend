const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const File = require('../models/File');

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// @route   POST api/files/upload
// @desc    Upload a file
// @access  Private
router.post('/upload', [auth, upload.single('file')], async (req, res) => {
    try {
        const { path: tempPath, originalname, size } = req.file;
        
        const encryptionKey = crypto.randomBytes(32);
        const iv = crypto.randomBytes(16);

        const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);

        const encryptedFileName = `${Date.now()}-${originalname}.enc`;
        const encryptedFilePath = path.join('uploads', encryptedFileName);

        const readStream = fs.createReadStream(tempPath);
        const writeStream = fs.createWriteStream(encryptedFilePath);

        readStream.pipe(cipher).pipe(writeStream);

        writeStream.on('finish', async () => {
            fs.unlink(tempPath, (err) => { // Delete the temporary unencrypted file
                if (err) console.error("Error deleting temp file:", err);
            });

            const newFile = new File({
                user: req.user.id,
                originalName: originalname,
                encryptedName: encryptedFileName,
                path: encryptedFilePath,
                size,
                iv: iv.toString('hex'),
                encryptionKey: encryptionKey.toString('hex'),
            });

            await newFile.save();

            res.status(201).json({ msg: 'File uploaded and encrypted successfully', file: newFile });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/files
// @desc    Get all user files
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const files = await File.find({ user: req.user.id }).select('-encryptionKey -iv'); // Exclude sensitive data
        res.json(files);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/files/download/:id
// @desc    Download a file
// @access  Private or Public via share link
router.get('/download/:id', auth, async (req, res) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({ msg: 'File not found' });
        }

        // For now, we only allow the owner to download. We will add share link logic later.
        if (file.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const decryptionKey = Buffer.from(file.encryptionKey, 'hex');
        const iv = Buffer.from(file.iv, 'hex');

        const decipher = crypto.createDecipheriv('aes-256-cbc', decryptionKey, iv);

        const encryptedFilePath = path.join(__dirname, '..', file.path); // Go up one level from routes
        const readStream = fs.createReadStream(encryptedFilePath);
        
        res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
        
        readStream.pipe(decipher).pipe(res);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/files/download/shared/:token
// @desc    Download a file via a shared link
// @access  Public
router.get('/download/shared/:token', async (req, res) => {
    try {
        const file = await File.findOne({ shareToken: req.params.token });

        if (!file) {
            return res.status(404).json({ msg: 'File not found or invalid link' });
        }

        if (new Date() > file.shareLinkExpires) {
            return res.status(410).json({ msg: 'Link has expired' });
        }

        const decryptionKey = Buffer.from(file.encryptionKey, 'hex');
        const iv = Buffer.from(file.iv, 'hex');

        const decipher = crypto.createDecipheriv('aes-256-cbc', decryptionKey, iv);

        const encryptedFilePath = path.join(__dirname, '..', file.path);
        const readStream = fs.createReadStream(encryptedFilePath);
        
        res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
        
        readStream.pipe(decipher).pipe(res);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/files/share/:id
// @desc    Generate a shareable link for a file
// @access  Private
router.post('/share/:id', auth, async (req, res) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({ msg: 'File not found' });
        }

        if (file.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const shareToken = crypto.randomBytes(32).toString('hex');
        const shareLinkExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        file.shareToken = shareToken;
        file.shareLinkExpires = shareLinkExpires;

        await file.save();

        const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/shared/${shareToken}`;
        res.json({ shareUrl });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/files/:id
// @desc    Delete a file
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({ msg: 'File not found' });
        }

        if (file.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        // Delete file from filesystem
        fs.unlink(file.path, (err) => {
            if (err) {
                console.error("Error deleting file from filesystem:", err);
                // We can choose to continue and still remove the DB entry, or return an error
            }
        });

        await File.deleteOne({ _id: req.params.id });

        res.json({ msg: 'File deleted successfully' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router; 