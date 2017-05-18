const SpotifyAuth = require('./SpotifyAuth');

module.exports = class Spotify extends SpotifyAuth {

    constructor(options) {
        super(options);

        return this;
    }

    play(trackUri) {
        const playOptions = {
            uris: [trackUri]
        };
        const options = trackUri ? playOptions : undefined;
        this.remoteApi.playTracks(options);
    }

    pause() {
        this.remoteApi.pause();
    }

    async getCurrentPlaybackState() {
        const currentState = await this.remoteApi.getMyCurrentPlaybackState();

        return currentState.body;
    }

    async getCurrentTrackUri() {
        const {item} = await this.getCurrentPlaybackState();

        return item.uri;
    }

    async getCurrentVolume() {
        const currentState = await this.getCurrentPlaybackState();

        return currentState.device.volume_percent;
    }

    setVolume(volumeInPercents) {
        this.remoteApi.setVolume(volumeInPercents);
    }
};
