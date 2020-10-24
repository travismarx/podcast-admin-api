const oauth2orize = require("oauth2orize");
const uid = require("uid");
const Promise = require("bluebird");
const authServer = oauth2orize.createServer();
var jwt = require("jsonwebtoken");
var token = jwt.sign({ foo: "bar" }, "shhhhh");

const grant = () => {
  return new Promise((resolve, reject) => {
    authServer.grant(
      oauth2orize.grant.code((client, redirectUri, user, response, done) => {
        const code = uid(16);
        console.log(code, "code to grant");

        const ac = new AuthorizationCode(code, client.id, redirectUri, user.id, response.scope);
        ac.save(err => {
          if (err) return done(err);
          return done(null, code);
        });
      })
    );
  });
};

const exchange = () => {
  authServer.exchange(
    oauth2orize.exchange.code((client, code, redirectURI, done) => {
      AuthorizationCode.findOne(code, (err, code) => {
        if (err) {
          return done(err);
        }
        if (client.id !== code.clientId) {
          return done(null, false);
        }
        if (redirectURI !== code.redirectUri) {
          return done(null, false);
        }

        var token = uid(256);
        var at = new AccessToken(token, code.userId, code.clientId, code.scope);
        at.save(err => {
          if (err) {
            return done(err);
          }
          return done(null, token);
        });
      });
    })
  );
};

module.exports = { grant, exchange };
