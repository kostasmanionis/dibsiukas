const botkit = require('botkit');

const controller = botkit.slackbot({
    disable_startup_messages: false
});

const bot = controller.spawn({
    token: process.env.SLACK_BOT_TOKEN
});

bot.startRTM(function(err,bot,payload) {
    if (err) {
        throw new Error(err);
    }
});

function getReply(message, action) {
    return `Sorry <@${message.user}>, I can't ${action} songs yet :shiba-sad:`
}

controller.hears('play (.*)', 'direct_message, direct_mention', function(bot, message) {
    // const songUri = message.match[1];
    bot.reply(message, getReply(message, 'play'));
});

controller.hears('pause (.*)', 'direct_message, direct_mention', function(bot, message) {
    bot.reply(message, getReply(message, 'pause'));
});

controller.hears('queue (.*)', 'direct_message, direct_mention', function(bot, message) {
    bot.reply(message, getReply(message, 'queue'));
});
