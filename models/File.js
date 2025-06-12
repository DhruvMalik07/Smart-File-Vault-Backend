const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    encryptedName: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    encryptionKey: {
        type: String,
        required: true
    },
    iv: {
        type: String,
        required: true
    },
    shareToken: {
        type: String,
        default: null
    },
    shareLinkExpires: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('file', FileSchema); 