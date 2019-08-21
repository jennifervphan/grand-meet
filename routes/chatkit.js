const Chatkit = require('@pusher/chatkit-server');

const chatkit = new Chatkit.default({
    instanceLocator: process.env.chatkit_instance_locator,
    key: process.env.chatkit_secretkey
})

module.exports = chatkit;