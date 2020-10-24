const fs = require("fs");
const express = require("express");
const router = express.Router();
const FILE_LOCATIONS = require("../utils/constants");

router.route("/").post((req, res) => {
  const fileLocation = FILE_LOCATIONS[req.query.show] + req.file.originalname.replace(/ /, "");
  const fileData = req.file.buffer;
  // const fileData = req.files.file.data;

  let writeStream = fs.createWriteStream(fileLocation);

  writeStream.write(fileData);

  writeStream.on("finish", () => {
    // console.log("finished");
    res.send();
  });

  writeStream.on("error", e => {
    console.log(e, "error trying to upload");
  });

  writeStream.end();
  // console.log(fileData, 'filedata');

  // fs.writeFile(fileLocation, fileData, (err, data) => {
  //   if (err) {
  //     console.log(err, 'error');
  //     return res.send(err);
  //   } else {
  //     console.log(data, 'data');
  //     res.send(data);
  //   }
  // });
});

module.exports = router;
