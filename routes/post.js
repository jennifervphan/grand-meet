const express = require('express');
const router = express.Router();
const Post = require('../models/post-model');
const User = require('../models/user-model');
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
            res.status(200).json(post)
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
                    // function filterByID(post) {
                    //     if (post.author._id === user._id) {
                    //         return true;
                    //     } else {
                    //         return false;
                    //     }
                    // }

                    // let usersPosts = posts.filter(filterByID)
                    // for (var i = 0; i < posts.length; i++) {
                    //     if (posts[i].author._id === user._id) {
                    //         console.log("same")
                    //     }
                    // }
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

module.exports = router