const express = require('express');
const router = express.Router();
const Post = require('../models/post-model');
const User = require('../models/user-model');
const Comment = require('../models/comment-model');
const mongoose = require('mongoose');

router.get('/post', (req, res, next) => {
    Post.find({}, null, {
            sort: {
                writtenAt: -1
            }
        })
        .populate('author')
        .then(posts => {
            res.status(200).json(posts);
        })
        .catch(err => {
            console.log(err)
        })
})

router.post('/post', (req, res, next) => {
    let newPost = new Post({
        text: req.body.text.split("\n"),
        title: req.body.title,
        author: mongoose.Types.ObjectId(req.user._id)
    })

    newPost.save(
            Post.populate(newPost, 'author'))
        .then(post => {
            res.status(200).json(post)
        })
        .catch(error => {
            console.error(error)
            next(error)
        })
})

router.get('/post/:id', (req, res, next) => {
    let postId = mongoose.Types.ObjectId(req.params.id);
    Post.findOne({ _id: postId })
        .populate('author')
        .then(post => {
            Comment.find({
                    post: postId
                }, null, {
                    sort: {
                        writtenAt: -1
                    }
                })
                .populate("author")
                .then(comments => {
                    res.status(200).json({ post, comments })
                })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/postsBy/:id', (req, res, next) => {
    let userId = req.params.id;
    User.findOne({ _id: userId })
        .then(user => {
            Post.find()
                .populate('author')
                .then((posts) => {
                    res.status(200).json(posts)
                })
                .catch(err => {
                    console.log(err)
                })
        })
        .catch(err => {
            console.log(err)
        })
})

router.post('/editPost/:id', (req, res, next) => {
    let postId = mongoose.Types.ObjectId(req.params.id);
    let updatePost = {
        title: req.body.title,
        text: req.body.text.split("\n"),
        writtenAt: new Date()
    }
    Post.findByIdAndUpdate(postId, updatePost, { new: true })
        .then(updated => {
            res.status(200).json(updated)
        })
        .catch(err => {
            console.log(err)
        })
})

router.post('/deletePost/:id', (req, res, next) => {
    let postId = mongoose.Types.ObjectId(req.params.id);
    Post.findByIdAndDelete({ _id: postId })
        .then(() => {
            res.status(200).json({ post: null })
        })
        .catch(err => {
            console.log(err)
        })
})

router.post('/post/:id/comment', (req, res, next) => {
    let postId = req.params.id
    let user = req.body.user
    console.log(req.body)
    Post.findById(postId).then(post => {
        let newComment = new Comment({
            author: mongoose.Types.ObjectId(user._id),
            post: mongoose.Types.ObjectId(postId),
            text: req.body.comment.split("\n")
        })
        newComment.save()
            .then(() => {
                Post.findOne({ _id: postId })
                    .populate("author")
                    .then(post => {
                        Comment.find({
                                post: postId
                            }, null, {
                                sort: {
                                    writtenAt: -1
                                }
                            })
                            .populate("author")
                            .then(comments => {
                                res.status(200).json({ post, comments })
                            })
                    })
            })
    }).catch(error => {
        console.error(error)
    })
});
module.exports = router