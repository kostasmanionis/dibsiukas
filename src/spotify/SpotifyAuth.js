const SpotifyWebApi = require('spotify-web-api-node');
const fs = require('fs');
const express = require('express');

const TOKEN_CACHE_LOCATION = './.token';
const SPOTIFY_ACCESS_TOKEN_DURATION = process.env.SPOTIFY_ACCESS_TOKEN_DURATION || 120;

module.exports = class SpotifyAuth {

    constructor() {
        this.tokenData = {};
        this.setApi();
        this.loadTokensFromCache();

        this.onTokenRefreshLoopTick = this.onTokenRefreshLoopTick.bind(this);

        try {
            this.setTokens();
        } catch (err) {
            console.log('Needs authorization');
        }
    }

    setApi() {
        this.remoteApi = new SpotifyWebApi({
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
            redirectUri: `http://${process.env.AUTH_HOST}:7777/auth`
        });
    }

    loadTokensFromCache() {
        try {
            this.tokenData = JSON.parse(fs.readFileSync(TOKEN_CACHE_LOCATION, 'utf-8'));
        } catch (err) {
            this.tokenData = null;
        }
    }

    cacheTokenData(accessTokenData) {
        const accessToken = accessTokenData.body['access_token'];
        const refreshToken = accessTokenData.body['refresh_token'] || this.tokenData.refreshToken;
        const expiresOn = this.getCurrentTimeInSeconds() + accessTokenData.body['expires_in'];
        Object.assign(this.tokenData, {accessToken, refreshToken, expiresOn});
        fs.writeFileSync(TOKEN_CACHE_LOCATION, JSON.stringify(this.tokenData), 'utf-8');
    }

    async handleReceivedAuthCode(token) {
        const accessTokens = await this.fetchAccessTokens(token);
        await this.handleReceivedTokens(accessTokens);
    }

    async getUserDetails() {
        return this.remoteApi.getMe();
    }

    async handleReceivedTokens(accessTokenData) {
        this.cacheTokenData(accessTokenData);
        await this.setTokens();
    }

    async setTokens() {
        if (this.tokenData.refreshToken) {
            const {accessToken, refreshToken} = this.tokenData;
            this.remoteApi.setAccessToken(accessToken);
            this.remoteApi.setRefreshToken(refreshToken);
            console.log('Setting access & refresh tokens');
            const userResponse = await this.getUserDetails();
            this.userDetails = userResponse.body;
            this.runTokenRefreshLoop();
        } else {
            console.log('There is no token to be set.');
        }
    }

    getCurrentTimeInSeconds() {
        return new Date().getTime() / 1000;
    }

    async fetchAccessTokens(token) {
        return this.remoteApi.authorizationCodeGrant(token);
    }

    runTokenRefreshLoop() {
        clearInterval(this.tokenRefreshInterval);
        this.tokenRefreshInterval = setInterval(this.onTokenRefreshLoopTick, 10000);
    }

    clearTokenRefreshLoop() {
        clearInterval(this.tokenRefreshInterval);
    }

    getTimeUntilTokenExpires() {
        return Math.floor(this.tokenData.expiresOn - this.getCurrentTimeInSeconds());
    }

    async onTokenRefreshLoopTick() {
        const expiresIn = this.getTimeUntilTokenExpires();
        if (expiresIn <= SPOTIFY_ACCESS_TOKEN_DURATION) {
            console.log('Attempting to refresh token');
            const refreshResponse = await this.remoteApi.refreshAccessToken();
            this.handleReceivedTokens(refreshResponse);
            console.log('Refreshed token. It now expires in ' + this.getTimeUntilTokenExpires() + ' seconds!');
        } else if (expiresIn <= 0) {
            console.log('Can\'t refresh token. Need to reauthorize');
            this.clearTokenRefreshLoop();
            this.initAuthorize();
        } else {
            console.log(`Token expires in ${expiresIn} seconds`);
        }
    }

    generateAuthUrl() {
        const scopes = [
            'user-read-private',
            'user-read-email',
            'user-modify-playback-state',
            'playlist-modify-public',
            'playlist-modify-private',
            'user-read-playback-state'
        ];
        const state = 'kostas';

        return this.remoteApi.createAuthorizeURL(scopes, state);
    }

    setupAuthServer() {
        if (!this.authServer) {
            this.authServer = express();

            this.authServer.get('/auth', (req, res) => {
                if (req.query.code) {
                    this.handleReceivedAuthCode(req.query.code);
                }
                res.send('Thanks!');
            });

            this.authServer.listen(process.env.AUTH_PORT, function () {
                console.log(`Authorization server listening on ${process.env.AUTH_PORT}!`);
            });
        }
    }

    initAuthorize() {
        this.setupAuthServer();
        return this.generateAuthUrl();
    }
};
