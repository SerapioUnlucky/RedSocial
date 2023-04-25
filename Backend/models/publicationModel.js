const {Schema, model} = require('mongoose');

const PublicationSchema = Schema({
    text: {
        type: String,
        required: true
    },
    file: String,
    created_at: {
        type: Date,
        default: Date.now
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    }
});

module.exports = model('Publication', PublicationSchema, 'publications');
