const r = require("../managers/rethinkdb");
const crypto = require("crypto");
const express = require("express");
const router = express.Router();
const authUtils = require("../utils/authUtils");

//////////

router.route("/").post(async (req, res) => {
  const authHeader = req.headers.authorization;
  const authStr = authUtils.decrypt(authHeader);
  const authArr = authStr.split(" ");

  const updateUser = await r
    .table("admin_users")
    .get(authArr[0])
    .update({ token: null, token_exp: null })
    .run();

  if (!updateUser.errors) {
    res.sendStatus(200);
  } else {
    res.sendStatus(500);
  }
});

module.exports = router;
