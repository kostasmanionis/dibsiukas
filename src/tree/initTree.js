const Tree = require('./Tree');
const TYPES_MESSAGES = ['direct_message', 'direct_mention'];

function init({ controller }) {
    const tree = new Tree({ treeHost: process.env.TREE_HOST });

    controller.hears(['tree (.*) (.*)', 'tree (.*)', 'tree'], TYPES_MESSAGES, function(
        bot,
        message
    ) {
        switch (message.match[1]) {
            case 'animations': {
                return tree.respondToAnimations(bot, message);
            }
            case 'start': {
                return tree.respondToStart(bot, message, message.match[2]);
            }
            case 'stop': {
                return tree.respondToStop(bot, message);
            }
            case 'on': {
                return tree.respondToOn(bot, message);
            }
            case 'off': {
                return tree.respondToOff(bot, message);
            }
            default: {
                return bot.reply(message, 'What do you want from me?');
            }
        }
    });

    controller.on('interactive_message_callback', function(bot, message) {
        return tree.respondToStart(bot, message, message.actions[0].value);
    });
}

module.exports = init;
