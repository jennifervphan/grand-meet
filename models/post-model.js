var mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const postSchema = new Schema({
    author: {
        type: ObjectId,
        required: true,
        ref: "users"
    },
    writtenAt: {
        type: Date,
        default: Date.now
    },
    title: {
        type: String,
        require: true
    },
    imageName: {
        type: String,
    },
    imageUrl: {
        type: String,
    },
    text: [{
        type: String,
        required: true
    }],
    likes: [{
        type: ObjectId,
        ref: 'users',
        default: []
    }]
}, {
    collection: 'posts'
})

const Post = mongoose.model('posts', postSchema);
module.exports = Post;