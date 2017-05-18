const SpotifyAuth = require('./SpotifyAuth');

module.exports = class Spotify extends SpotifyAuth {

    constructor(options) {
        super(options);

        return this;
    }

    play(trackUri) {
        this.remoteApi.playTracks({
            uris: [trackUri]
        });
    }
};
