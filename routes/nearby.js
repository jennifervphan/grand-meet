const express = require('express');
const router = express.Router();
const User = require('../models/user-model.js');

router.get('/nearby', (req, res, next) => {
    User.find()
        .then(users => {
            for (var j = 0; j < users.length; j++) {
                if (users[j].username === req.user.username) {
                    users.splice(j, 1);
                    j--
                }
            }
            res.status(200).json(users);
        })
        .catch(err => {
            console.log(err);
        })
});

router.get('/nearby/:id', (req, res, next) => {
    let userId = req.params.id;
    User.findOne({ _id: userId })
        .then(user => {
            res.status(200).json(user);
        })
        .catch(err => {
            console.log(err)
        })
})

module.exports = router;