const express = require("express");
const router = express.Router();
const csv = require("csvtojson");

//////////

function Recipient(data) {
  this.address = {
    email: data[0],
    name: data[1]
  };
}

//////////

router.route("/").post((req, res) => {
  // console.log(req.files, 'request');
  let csvData = req.files.file.data.toString();
  let recipientsArray = [];

  csv({ ignoreEmpty: true })
    .fromString(csvData)
    .on("csv", data => {
      if (data.length) {
        recipientsArray.push(new Recipient(data));
        // Object.assign(
        //   {},
        //   {
        //     address: {
        //       email: data[0],
        //       name: data[1]
        //     }
        //   }
        // )
        // );
      }
    })
    .on("done", err => {
      if (err) console.log(err);
      res.send(recipientsArray);
    });
});

module.exports = router;
