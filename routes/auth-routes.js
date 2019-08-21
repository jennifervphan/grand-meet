const express = require('express');
const authRoutes = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const uploadCloud = require('../configs/cloudinary');
const User = require('../models/user-model');
const Chatkit = require('@pusher/chatkit-server');

const chatkit = new Chatkit.default({
    instanceLocator: process.env.chatkit_instance_locator,
    key: process.env.chatkit_secretkey
})

authRoutes.post('/signup', uploadCloud.single('picture'), (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        res.status(400).json({ message: 'Provide username and password' });
        return;
    }

    if (password.length < 7) {
        res.status(400).json({ message: 'Please make your password at least 8 characters long for security purposes.' });
        return;
    }

    User.findOne({ username }, (err, foundUser) => {

        if (err) {
            res.status(500).json({ message: "Username check went bad." });
            return;
        }

        if (foundUser) {
            res.status(400).json({ message: 'Username taken. Choose another one.' });
            return;
        }

        const salt = bcrypt.genSaltSync(10);
        const hashPass = bcrypt.hashSync(password, salt);

        const aNewUser = new User({
            username: username,
            password: hashPass,
            profilePicUrl: req.file.url,
            profilePicName: req.file.originalname,
            longitude: req.body.longitude,
            latitude: req.body.latitude
        });

        aNewUser.save(err => {
            if (err) {
                res.status(400).json({ message: 'Saving user to database went wrong.' });
                return;
            }
            // Automatically log in user after sign up
            // .login() here is actually predefined passport method
            req.login(aNewUser, (err) => {

                if (err) {
                    res.status(500).json({ message: 'Login after signup went bad.' });
                    return;
                }
                // chatkit creat new user

                chatkit.createUser({
                        id: aNewUser.username,
                        name: aNewUser.username
                    })
                    .then((user) => {
                        res.sendStatus(201)
                    })
                    .catch((err) => {
                        console.log(err)
                    })
                let { username, _id, profilePicUrl, about, longitude, latitude } = aNewUser;
                res.status(200).json({ username, _id, profilePicUrl, about, longitude, latitude });
            });
        });
    });
});

authRoutes.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, theUser, failureDetails) => {
        if (err) {
            res.status(500).json({ message: 'Something went wrong authenticating user' });
            return;
        }

        if (!theUser) {
            // "failureDetails" contains the error messages
            // from our logic in "LocalStrategy" { message: '...' }.
            res.status(401).json(failureDetails);
            return;
        }

        // save user in session
        req.login(theUser, (err) => {
            if (err) {
                res.status(500).json({ message: 'Session save went bad.' });
                return;
            }
            User.findByIdAndUpdate(theUser._id, {
                    longitude: req.body.coordinates.longitude,
                    latitude: req.body.coordinates.latitude
                }, { new: true })
                .then(user => {
                    req.session.user = user;
                    chatkit.createUser({
                            name: user.username,
                            id: user.username
                        })
                        .then((newuser) => {
                            console.log(newuser)
                            res.sendStatus(201)
                        })
                        .catch((err) => {
                            if (err.error_type === "servies/chatkit/user_already_exists") {
                                res.sendStatus(200)
                            } else {
                                console.log(err)
                            }
                        })

                    let { username, _id, profilePicUrl, about, longitude, latitude } = user;
                    res.status(200).json({ username, _id, profilePicUrl, about, longitude, latitude });
                })
                // We are now logged in (that's why we can also send req.user)

        });
    })(req, res, next);
});

authRoutes.post('/logout', (req, res, next) => {
    // req.logout() is defined by passport
    req.logout();
    res.status(200).json({ message: 'Log out success!' });
});


authRoutes.get('/loggedin', (req, res, next) => {
    // req.isAuthenticated() is defined by passport
    if (req.isAuthenticated()) {
        res.status(200).json(req.user);
        return;
    }
    res.status(403).json({ message: 'Unauthorized' });
});

authRoutes.post('/authenticate', (req, res) => {
    const authData = chatkit.authenticate({
        userId: req.query.user_id,
    });
    res.status(authData.status).send(authData.body);
})

module.exports = authRoutes;