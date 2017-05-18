const botkit = require('botkit');
const Spotify = require('./spotify/Spotify');

const controller = botkit.slackbot({
    disable_startup_messages: false // eslint-disable-line camelcase
});

const slackBot = controller.spawn({
    token: process.env.SLACK_BOT_TOKEN
});

const spotify = new Spotify();

spotify.connect();

slackBot.startRTM(function (err) {
    if (err) {
        throw new Error(err);
    }
});

const TYPES_MESSAGES = 'direct_message, direct_mention';

function getReply(message, action) {
    return `Sorry <@${message.user}>, I can't ${action} songs yet :shiba-sad:`;
}

controller.hears('play <(.*)>', TYPES_MESSAGES, function (bot, message) {
    const trackUri = message.match[1];
    spotify.play(trackUri);
    bot.reply(message, `Playing ${trackUri}`);
});

controller.hears('pause (.*)', TYPES_MESSAGES, function (bot, message) {
    bot.reply(message, getReply(message, 'pause'));
});

controller.hears('queue (.*)', TYPES_MESSAGES, function (bot, message) {
    bot.reply(message, getReply(message, 'queue'));
});
