// const r = require("rethinkdbdash")({ db: "main" });
const r = require("../managers/rethinkdb");
const crypto = require("crypto");
const express = require("express");
const router = express.Router();
const authUtils = require("../utils/authUtils");
const authServer = require("../utils/authServer");
const generalUtils = require("../utils/generalUtils");
const moment = require("moment");

//////////

router.route("/").post(async (req, res) => {
  const userId = req.body.username.toLowerCase();
  const reqPasswd = req.body.password;

  console.log(userId, "user id");
  console.log(reqPasswd, "password");

  const user = await r
    .table("admin_users")
    .get(userId)
    .run();
  console.log();
  if (!user) return res.sendStatus(401);

  const verified = await authUtils.verifyHash(reqPasswd, user.password);
  console.log(verified, "verified?");
  if (!verified) return res.sendStatus(401);

  const tokenBytes = authUtils.encrypt(generalUtils.randomBytes(12));
  const token = authUtils.encrypt(userId + " " + tokenBytes);
  const token_exp = parseInt(
    moment()
      .add(3, "w")
      .format("X")
  );

  const updateToken = await r
    .table("admin_users")
    .get(userId)
    .update({ token: tokenBytes, token_exp: token_exp }, { returnChanges: true })
    .run();

  // If there are no errors, assign token and respond success
  if (!updateToken.errors) {
    let updatedUser = updateToken.changes[0].new_val;
    delete updatedUser.password;
    delete updatedUser.token_exp;

    res.json(token);
  } else {
    res.sendStatus(500).statusMessage(updateToken.errors);
  }
});

module.exports = router;
