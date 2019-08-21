const express = require('express');
const router = express.Router();
const User = require('../models/user-model.js');
const chatkit = require('./chatkit');

router.get('/inbox', (req, res, next) => {
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