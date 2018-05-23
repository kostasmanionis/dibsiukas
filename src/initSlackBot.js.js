const botkit = require('botkit');
const initTree = require('./tree/initTree');
const initSpotify = require('./spotify/initSpotify');

const controller = botkit
    .slackbot({
        disable_startup_messages: false, // eslint-disable-line camelcase
        clientId: process.env.SLACK_CLIENT_ID,
        clientSecret: process.env.SLACK_CLIENT_SECRET,
        scopes: ['bot'],
        json_file_store: __dirname + '/.data/db/',
    })
    .setupWebserver(process.env.WEBHOOK_PORT, function() {
        // set up web endpoints for oauth, receiving webhooks, etc.
        controller.createWebhookEndpoints(controller.webserver);
        controller.startTicking();
        connectToSlack();
    });

const slackBot = controller.spawn({
    token: process.env.SLACK_BOT_TOKEN,
});

initTree({ controller });
initSpotify({ controller });

function connectToSlack() {
    slackBot.startRTM(function(err) {
        if (err) {
            setTimeout(connectToSlack, 5000);
        }
        const botData = slackBot.identifyBot();

        controller.storage.teams.save({
            id: botData.team_id,
            bot: {
                user_id: botData.id,
                name: botData.name,
            },
        });
    });
}

const TYPES_MESSAGES = ['direct_message', 'direct_mention'];

controller.on('rtm_close', connectToSlack);

controller.hears('help', TYPES_MESSAGES, function(bot, message) {
    bot.reply(
        message,
        'Too lazy to add a help response :jack_o_lantern: :jack_o_lantern: :jack_o_lantern: '
    );
});
