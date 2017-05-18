const SpotifyAuth = require('./SpotifyAuth');
const {
    getUriType,
    TYPE_TRACK,
    TYPE_ALBUM,
    TYPE_PLAYLIST
} = require('../utils/spotifyUtils');

module.exports = class Spotify extends SpotifyAuth {

    constructor(options) {
        super(options);

        return this;
    }

    playTrack(trackUri) {
        this.remoteApi.play({
            uris: [trackUri]
        });
    }

    playAlbumOrPlaylist(uri) {
        this.remoteApi.play({
            context_uri: uri
        });
    }

    play(uri) {
        switch (getUriType(uri)) {
            case TYPE_ALBUM:
            case TYPE_PLAYLIST:
                this.playAlbumOrPlaylist(uri);
                break;
            case TYPE_TRACK:
                this.playTrack(uri);
                break;
        }
    }

    resume() {
        this.remoteApi.play();
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
