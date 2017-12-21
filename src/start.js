const botkit = require('botkit');
const Spotify = require('./spotify/Spotify');
const Tree = require('./tree/Tree');

const spotify = new Spotify();
const controller = botkit.slackbot({
    disable_startup_messages: false, // eslint-disable-line camelcase
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    scopes: ['bot'],
    json_file_store: __dirname + '/.data/db/'
}).setupWebserver(process.env.WEBHOOK_PORT, function(err,webserver) {
    // set up web endpoints for oauth, receiving webhooks, etc.
    controller.createWebhookEndpoints(controller.webserver);
    controller.startTicking();
    connectToSlack();
});
const slackBot = controller.spawn({
    token: process.env.SLACK_BOT_TOKEN
});
const tree = new Tree({treeHost: process.env.TREE_HOST});

function connectToSlack() {
    slackBot.startRTM(function (err) {
        if (err) {
            console.log(err);
        }
        const botData = slackBot.identifyBot();

        controller.storage.teams.save({
            id: botData.team_id,
            bot: {
                user_id: botData.id,
                name: botData.name
            }
        });
    });
}

const TYPES_MESSAGES = ['direct_message', 'direct_mention'];

function getReply(message, action) {
    return `Sorry <@${message.user}>, I can't ${action} songs yet :shiba-sad:`;
}

controller.on('rtm_close', connectToSlack);

controller.hears('connect spotify', TYPES_MESSAGES, async function (bot, message) {
    const authUrl = await spotify.initAuthorize();
    bot.reply(message, `${authUrl}`);
});

controller.hears('playing', TYPES_MESSAGES, async function (bot, message) {
    const currentPlayBack = await spotify.getCurrentPlaybackState();
    const isPlaying = currentPlayBack.is_playing;
    const currentTrackUri = currentPlayBack.item.uri;

    if (isPlaying) {
        bot.reply(message, `<${currentTrackUri}>`);
    } else {
        bot.reply(message, `:no_entry_sign: :radio: :musical_note:`);
    }
});

controller.hears('play next', TYPES_MESSAGES, async function (bot, message) {
    spotify.playNext();
    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'ok_hand'
    });
});

controller.hears(['play <(.*)>', 'play', 'resume'], TYPES_MESSAGES, function (bot, message) {
    const uri = message.match[1];

    if (uri) {
        spotify.play(uri);
    } else {
        spotify.resume();
    }

    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'ok_hand'
    });
});

controller.hears('pause', TYPES_MESSAGES, function (bot, message) {
    spotify.pause();
    bot.reply(message, `:no_entry_sign: :radio: :musical_note:`);
});

controller.hears('queue', TYPES_MESSAGES, function (bot, message) {
    bot.reply(message, getReply(message, 'queue'));
});

controller.hears(['volume (.*)', 'volume'], TYPES_MESSAGES, async function (bot, message) {
    const volumeToSet = message.match[1];
    if (volumeToSet) {
        spotify.setVolume(volumeToSet);
        bot.api.reactions.add({
            timestamp: message.ts,
            channel: message.channel,
            name: 'ok_hand'
        });
    } else {
        const currentVolume = await spotify.getCurrentVolume();
        bot.reply(message, `:radio: :musical_note: ${currentVolume}`);
    }
});

controller.hears('help', TYPES_MESSAGES, function (bot, message) {
    bot.reply(message, 'Too lazy to add a help response :jack_o_lantern: :jack_o_lantern: :jack_o_lantern: ');
});

controller.hears(['tree (.*) (.*)', 'tree (.*)', 'tree'], TYPES_MESSAGES, function (bot, message) {
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

controller.on('interactive_message_callback', function (bot, message) {
    return tree.respondToStart(bot, message, message.actions[0].value);
});
