const got = require('got');

const PATH_ANIMATIONS = 'animations';
const PATH_START_ANIMATION = 'start-animation';
const PATH_STOP_ANIMATION = 'stop-animation';
const PATH_TURN_ON = 'turn-on';
const PATH_TURN_OFF = 'turn-off';


class Tree {
    constructor(options) {
        this.treeHost = options.treeHost;
    }

    async _doRequest(path, query) {
        try {
            const result = await got(`http://${this.treeHost}/${path}`, {query});
            return JSON.parse(result.body);
        } catch (err) {
            return err;
        }
    }

    _getAnimations() {
        return this._doRequest(PATH_ANIMATIONS);
    }

    _startAnimation(animation) {
        return this._doRequest(PATH_START_ANIMATION, {
            search: animation
        });
    }

    _stopAnimation() {
        return this._doRequest(PATH_STOP_ANIMATION);
    }

    _turnOn() {
        return this._doRequest(PATH_TURN_ON);
    }

    _turnOff() {
        return this._doRequest(PATH_TURN_OFF);
    }

    isError(err) {
        return err instanceof Error;
    }

    async respondToAnimations(bot, message) {
        const result = await this._getAnimations();
        let reply;
        if (this.isError(result)) {
            reply = 'Sorry, couldn\'t get the animation list.';
        } else {
            reply = {
                "text": "Choose an animation you want to play",
                "attachments": [
                    {
                        "fallback": "You are unable to choose a game",
                        "callback_id": "tree_animation",
                        "color": "#3AA3E3",
                        "attachment_type": "default",
                        "actions": result.map(animation => {
                            return {
                                "name": "game",
                                "text": animation.name,
                                "type": "button",
                                "value": animation.name
                            };
                        })
                    }
                ]
            };
        }

        bot.reply(message, reply);
    }

    async respondToStart(bot, message, query) {
        const result = await this._startAnimation(query);
        let reply;
        if (this.isError(result)) {
            reply = result.error;
        } else {
            reply = result.message;
        }

        bot.reply(message, reply);
    }

    async respondToStop(bot, message) {
        const result = await this._stopAnimation();
        let reply;
        if (this.isError(result)) {
            reply = 'Something went wrong, not sure if those animations stopped...';
        } else {
            reply = 'Stopped the animation.';
        }

        bot.reply(message, reply);
    }

    async respondToOn(bot, message) {
        const result = await this._turnOn();
        let reply;
        if (this.isError(result)) {
            reply = 'Ummmm... Is it on? Something might\'ve gone wrong.';
        } else {
            reply = 'Done! Can you see the lights? :christmasparrot: :christmas_tree: ';
        }

        bot.reply(message, reply);
    }

    async respondToOff(bot, message) {
        const result = await this._turnOff();
        let reply;
        if (this.isError(result)) {
            reply = '...';
        } else {
            reply = 'Poof! :ghost: It\`s dark :see_no_evil:';
        }

        bot.reply(message, reply);
    }
}

module.exports = Tree;
