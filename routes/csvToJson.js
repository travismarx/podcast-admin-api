const express = require("express");
const router = express.Router();
const csv = require("csvtojson");

router.route("/").post((req, res) => {
  // console.log(req.files, 'request');
  let csvData = req.files.file.data.toString();
  let recipientsArray = [];

  csv({ ignoreEmpty: true })
    .fromString(csvData)
    .on("csv", data => {
      if (data.length) {
        recipientsArray.push(
          Object.assign(
            {},
            {
              address: {
                email: data[0],
                name: data[1]
              }
            }
          )
        );
      }
    })
    .on("done", err => {
      if (err) console.log(err);
      res.send(recipientsArray)
    });
});

module.exports = router;
