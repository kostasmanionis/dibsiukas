const MESSAGE_TYPES = {
    MESSAGE_DIRECT: 'direct_message',
    MESSAGE_MENTION: 'direct_mention',
};

const BOT_LISTENS_TO_MESSAGE_TYPES = [MESSAGE_TYPES.MESSAGE_DIRECT, MESSAGE_TYPES.MESSAGE_MENTION];

module.exports = { MESSAGE_TYPES, BOT_LISTENS_TO_MESSAGE_TYPES };
