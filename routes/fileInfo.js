const express = require("express");
const router = express.Router();
const FILE_LOCATIONS = require("../utils/constants");

router.route("/").get((req, res) => {
  let fileName = req.query.fileName;
  let show = req.query.show;
  let path = FILE_LOCATIONS[show] + fileName;
  console.log(path, "path");
  if (path.slice(path.length - 4, path.length) !== ".mp3") path = path + ".mp3";
  // console.log(path, 'path');

  // var parser = mm(fs.createReadStream(path), function (err, metadata) {
  //   if (err) throw err;
  //   console.log(metadata);
  // });

  fs.existsSync(path);

  fs.stat(path, (err, probeData) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (err) {
      console.log(err, "ERROR");
      if (err.code === "ENOENT") {
        res.status(400).send({
          message: "File does not exist. Check to make sure the file name is correct"
        });
      }
      // console.log(err.code, 'err');
      // throw err;
    }
    res.send(probeData);
  });
});

module.exports = router;
