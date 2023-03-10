const bcrypt = require("bcrypt");
const crypto = require("crypto");
const Promise = require("bluebird");
const r = require("../managers/rethinkdb");
const moment = require("moment");

const algorithm = "aes-256-ctr";
const password = process.env.SCRT;

//////////

const hash_password = password => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (error, salt) => {
      if (error) return reject(error);

      bcrypt.hash(password, salt, (error, hash) => {
        if (error) return reject(error);
        resolve(hash);
      });
    });
  });
};

const verifyHash = (password, hash) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, (error, response) => {
      if (error) return reject(error);
      return resolve(response);
    });
  });
};

const encrypt = text => {
  var cipher = crypto.createCipher(algorithm, password);
  try {
    var crypted = cipher.update(text, "utf8", "hex");
    crypted += cipher.final("hex");
  } catch (e) {
    Error(e);
  } finally {
    return crypted;
  }
};

const decrypt = text => {
  try {
    var decipher = crypto.createDecipher(algorithm, password);
    var dec = decipher.update(text, "hex", "utf8");
    dec += decipher.final("utf8");
  } catch (e) {
    Error(e);
  } finally {
    return dec;
  }
};

const authenticateToken = async (req, res, next) => {
  console.log("Authenticating token");
  // Make sure an auth header actually exists
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.sendStatus(401);

  // Decrypt header with our cipher, or return if an error is thrown
  const authStr = decrypt(authHeader);
  if (!authStr) return res.sendStatus(401);

  // Split the str, [0] is our user, [1] is random
  let authArr = authStr.split(" ");
  if (authArr.length !== 2) return res.sendStatus(401);

  const dbUser = await r
    .table("admin_users")
    .get(authArr[0])
    .run();
  if (!dbUser) return res.sendStatus(401);

  if (dbUser.token_exp > moment().format("X")) {
    const decodedToken = decrypt(dbUser.token);

    // Check decoded strings match, next if true, 401 if not
    decodedToken === decrypt(authArr[1]) ? next() : res.sendStatus(401);
  } else {
    res.sendStatus(401);
    try {
      r.table("admin_users")
        .get(authArr[0])
        .update({ token: null, token_exp: null })
        .run();
    } catch (e) {
      console.log(e, "caught error!");
    }
  }
};

module.exports = { hash_password, verifyHash, encrypt, decrypt, authenticateToken };
