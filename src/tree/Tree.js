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
            return result;
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

    respondToAnimations(bot, message) {
        const result = this._getAnimations();
        let reply;
        if (this.isError(result)) {
            reply = 'Sorry, couldn\'t get the animation list.';
        } else {
            reply = JSON.parse(result.body).map(item => item.name).join('\n');
        }

        bot.reply(message, reply);
    }

    respondToStart(bot, message, query) {
        const result = this._startAnimation(query);
        const body = JSON.parse(result.body);
        let reply;
        if (this.isError(result)) {
            reply = body.error;
        } else {
            reply = body.message;
        }

        bot.reply(message, reply);
    }

    respondToStop(bot, message) {
        const result = this._stopAnimation();
        let reply;
        if (this.isError(result)) {
            reply = 'Something went wrong, not sure if those animations stopped...';
        } else {
            reply = 'Stopped tree animations.';
        }

        bot.reply(message, reply);
    }

    respondToOn(bot, message) {
        const result = this._turnOn();
        let reply;
        if (this.isError(result)) {
            reply = 'Ummmm... Is it on? Something might\'ve gone wrong.';
        } else {
            reply = 'Done! Can you see the lights? :christmasparrot: :christmas_tree: ';
        }

        bot.reply(message, reply);
    }

    respondToOff(bot, message) {
        const result = this._turnOff();
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
