const express = require('express');
const router = express.Router();
const User = require('../models/user-model.js');
const Chatkit = require('@pusher/chatkit-server');

const chatkit = new Chatkit.default({
    instanceLocator: process.env.chatkit_instance_locator,
    key: process.env.chatkit_secretkey
})

router.get('/newChat', (req, res, next) => {
    chatkit.getUserRooms({
            userId: `${req.user.username}`,
        })
        .then((rooms) => {
            res.status(200).send(rooms)
        }).catch((err) => {
            console.log(err);
        });
})

module.exports = router;