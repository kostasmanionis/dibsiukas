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

controller.hears('playing', TYPES_MESSAGES, async function (bot, message) {
    const currentTrackUri = await spotify.getCurrentTrackUri();
    bot.reply(message, `<${currentTrackUri}>`);
});

controller.hears(['play <(.*)>', 'play', 'resume'], TYPES_MESSAGES, function (bot, message) {
    const trackUri = message.match[1];
    if (trackUri) {
        bot.reply(message, `Playing ${trackUri}`);
    } else {
        bot.reply(message, `Resuming playback`);
    }
    spotify.play(trackUri);

});

controller.hears('pause', TYPES_MESSAGES, function (bot, message) {
    spotify.pause();
    bot.reply(message, `:no_entry_sign: :radio: :musical_note:`);
});

controller.hears('queue (.*)', TYPES_MESSAGES, function (bot, message) {
    bot.reply(message, getReply(message, 'queue'));
});

controller.hears(['volume (.*)', 'volume'], TYPES_MESSAGES, async function (bot, message) {
    const volumeToSet = message.match[1];
    if (volumeToSet) {
        spotify.setVolume(volumeToSet);
        bot.reply(message, `:radio: :musical_note: :point_right: ${volumeToSet}`);
    } else {
        const currentVolume = await spotify.getCurrentVolume();
        bot.reply(message, `:radio: :musical_note: ${currentVolume}`);
    }
});
