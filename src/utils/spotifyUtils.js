const TYPE_TRACK = 'track';
const TYPE_PLAYLIST = 'playlist';
const TYPE_ALBUM = 'album';

function getUriType(uri) {
    return [
        TYPE_ALBUM,
        TYPE_PLAYLIST,
        TYPE_TRACK
    ].find(type => uri.includes(type));
}

module.exports = {
    getUriType,
    TYPE_TRACK,
    TYPE_PLAYLIST,
    TYPE_ALBUM
};
