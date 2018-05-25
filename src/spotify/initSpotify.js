const Spotify = require('./Spotify');
const { BOT_LISTENS_TO_MESSAGE_TYPES } = require('../constants/slackConstants');

function getReply(message, action) {
    return `Sorry <@${message.user}>, I can't ${action} songs yet :shiba-sad:`;
}

function init({ controller }) {
    const spotify = new Spotify();

    controller.hears('connect spotify', BOT_LISTENS_TO_MESSAGE_TYPES, async function(bot, message) {
        const authUrl = await spotify.initAuthorize();
        bot.reply(message, `${authUrl}`);
    });

    controller.hears('playing', BOT_LISTENS_TO_MESSAGE_TYPES, async function(bot, message) {
        const currentPlayBack = await spotify.getCurrentPlaybackState();
        const isPlaying = currentPlayBack.is_playing;
        const currentTrackUri = currentPlayBack.item.uri;

        if (isPlaying) {
            bot.reply(message, `<${currentTrackUri}>`);
        } else {
            bot.reply(message, `:no_entry_sign: :radio: :musical_note:`);
        }
    });

    controller.hears('play next', BOT_LISTENS_TO_MESSAGE_TYPES, async function(bot, message) {
        spotify.playNext();
        bot.api.reactions.add({
            timestamp: message.ts,
            channel: message.channel,
            name: 'ok_hand',
        });
    });

    controller.hears(['play <(.*)>', 'play', 'resume'], BOT_LISTENS_TO_MESSAGE_TYPES, function(
        bot,
        message
    ) {
        const uri = message.match[1];

        if (uri) {
            spotify.play(uri);
        } else {
            spotify.resume();
        }

        bot.api.reactions.add({
            timestamp: message.ts,
            channel: message.channel,
            name: 'ok_hand',
        });
    });

    controller.hears('pause', BOT_LISTENS_TO_MESSAGE_TYPES, function(bot, message) {
        spotify.pause();
        bot.reply(message, `:no_entry_sign: :radio: :musical_note:`);
    });

    controller.hears('queue', BOT_LISTENS_TO_MESSAGE_TYPES, function(bot, message) {
        bot.reply(message, getReply(message, 'queue'));
    });

    controller.hears(['volume (.*)', 'volume'], BOT_LISTENS_TO_MESSAGE_TYPES, async function(
        bot,
        message
    ) {
        const volumeToSet = message.match[1];
        if (volumeToSet) {
            spotify.setVolume(volumeToSet);
            bot.api.reactions.add({
                timestamp: message.ts,
                channel: message.channel,
                name: 'ok_hand',
            });
        } else {
            const currentVolume = await spotify.getCurrentVolume();
            bot.reply(message, `:radio: :musical_note: ${currentVolume}`);
        }
    });
}

module.exports = init;
