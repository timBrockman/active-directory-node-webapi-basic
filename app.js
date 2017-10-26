'use strict';

const
      restify = require('restify')
    , restifyPlugins = require('restify-plugins')
    , passport = require('passport')
    , BearerStrategy = require('passport-azure-ad').BearerStrategy
    , config = require('./config')
    , authenticatedUserTokens = []
    , serverPort = process.env.PORT || config.serverPort
;

const authenticationStrategy = new BearerStrategy(config.credentials, (token, done) => {
    let userToken = authenticatedUserTokens.find((user) => user.sub === token.sub);

    if(!userToken) {
        authenticatedUserTokens.push(token);
    }

    return done(null, user, token);
});

passport.use(authenticationStrategy);

const server = restify.createServer({ name: 'Azure Active Directory with Node.js Demo' });
server.use(restifyPlugins.authorizationParser());
server.use(passport.initialize());
server.use(passport.session());

server.get('/', (req, res, next) => {
    res.send(200, 'Try: curl -isS -X GET http://127.0.0.1:3000/api');
    return next();
});

server.get('/api', passport.authenticate('oauth-bearer', { session: false }), (req, res, next) => {
    res.json({ message: 'response from API endpoint' });
    return next();
});

server.listen(serverPort);
