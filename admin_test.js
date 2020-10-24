// 'use strict';

const express = require("express");
const compression = require("compression");
const bodyParser = require("body-parser");
const request = require("request");
const fs = require("fs");
const passport = require("passport");
const mm = require("musicmetadata");
const LocalStrategy = require("passport-local").Strategy;
const api_app = express();
const ui_app = express();
const api_port = 5151;
const ui_port = 5353;

const fileLocations = {
  pulpmx: "/home/pulpshow/www/sites/pulpmxshow.com/files/podcasts/",
  steveshow: "/home/pulpmx/www/sites/default/files/podcasts/",
  keefer: "/home/pulpmx/www/sites/default/files/podcasts/",
  moto60: "/home/pulpmx/www/sites/default/files/podcasts/preshows/",
  hockey: "/home/pulpuck/www/shows/"
};

//////////

// Add headers
api_app.use((err, req, res, next) => {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Pass to next layer of middleware
  next();
});

api_app.use(
  bodyParser.json({
    limit: "5mb"
  })
); // support json encoded bodies
api_app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000
  })
); // support encoded bodies

//////////

api_app.get("/testroute", (req, res) => {
  res.send("Hello Test Route!");
  fs.writeFile(`${__dirname}/xml/testFile`, "Hello there tester!", err => {
    if (err) {
      return err;
    }

  });
});

api_app.post("/saveXml", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');

  let show = req.query.show;
  let xmlName = req.query.xmlName;
  let newStr = jsonToXML(req.body);

  fs.writeFile(`${__dirname}/xml_tests/${xmlName}.xml`, newStr, err => {
    res.setHeader("Access-Control-Allow-Origin", "*");

    if (err) {
      return res.send(err);
    }

    fs.writeFile(`/home/pulpmx/www/apptabs/${xmlName}.xml`, newStr, err => {
      res.setHeader("Access-Control-Allow-Origin", "*");

      if (err) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        return err;
      }

      // request.get(
      //   "http://www.feedburner.com/fb/a/pingSubmit", {
      //     bloglink: req.body.link.textContent
      //   },
      //   function (err, res) {
      //     if (err) {
      //       console.log(
      //         err,
      //         " : This error has occurred when pinging feedburner"
      //       );
      //     }
      //   }
      // );

      return res.send({
        status: 1
      });
    });

    // console.log('File saved');
    // res.send({
    //   status: 1
    // });
  });
});

api_app.get("/fileInfo", (req, res, next) => {
  console.log('Getting file info');
  let fileName = req.query.fileName;
  let show = req.query.show;
  let path = fileLocations[show] + fileName;
  if (path.slice(path.length - 4, path.length) !== '.mp3') path = path + '.mp3';
  // console.log(path, 'path');


  // var parser = mm(fs.createReadStream(path), function (err, metadata) {
  //   if (err) throw err;
  //   console.log(metadata);
  // });

  fs.existsSync(path)

  fs.stat(path, (err, probeData) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (err) {
      console.log(err, 'ERROR');
      if (err.code === 'ENOENT') {
        res.status(400).send({
          message: 'File does not exist. Check to make sure the file name is correct'
        });
      }
      // console.log(err.code, 'err');
      // throw err;
    }
    res.send(probeData);
  });
});

api_app.post('/streamserver', (req, res) => {
  const accountSid = process.env.TWILIO_ACC_SID; // Your Account SID from www.twilio.com/console
  const authToken = process.env.TWILIO_AUTH_TOKEN; // Your Auth Token from www.twilio.com/console

  const twilio = require('twilio')(accountSid, authToken);
  const regexMoto60 = /moto ?60/i;
  const regexPulp = /pulp ?m?x?/i;
  const isStart = /start/i;
  const isStop = /stop/i;
  const msg = req.body.Body;
  const fromNumber = req.body.From;
  // console.log(req.body.From);
  if (isStart) {
    // console.log('Is a start command');
    request.get('https://api.linode.com/?api_key=KKzuBoyUjvmOhIsfqA3HDfBrqsU8SUpU1f87uYd2cw3XdREOjiMjfmcb3z898mhA&LinodeID=2673153&api_action=linode.boot', (err, res) => {
      // console.log(res.body, 'boot request res');

      let resTimer = setInterval(() => {
        request.get('https://api.linode.com/?api_key=KKzuBoyUjvmOhIsfqA3HDfBrqsU8SUpU1f87uYd2cw3XdREOjiMjfmcb3z898mhA&LinodeID=2673153&api_action=linode.job.list', (err, res) => {
          // console.log(JSON.parse(res.body).DATA, 'job list res');
          if (JSON.parse(res.body).DATA && JSON.parse(res.body).DATA[0].HOST_SUCCESS === 1) {
            twilio.messages.create({
              body: 'Server successfully booted and ready for live stream!',
              to: fromNumber, // Text this number
              from: '+17028196617' // From a valid Twilio number
            }).then((msg) => {
              // console.log(msg, 'msg on response sent');
              clearInterval(resTimer);
            })
          }
        });
      }, 5000);
    })
  }
});

api_app.listen(5151, () => {
  console.log('Example app listening on port 5151');
});

////////////////////

const options = {
  maxAge: 300000
};

ui_app.use(
  compression({
    threshold: false
  })
);
ui_app.use(express.static("dist", options));

ui_app.get("/*", (req, res) => {
  // passport.authenticate('local');
  res.sendFile(`${__dirname}/dist/index.html`);
});

ui_app.listen(5353, () => {});

function jsonToXML(xmlInfo) {
  let language = "EN";

  let xmlStr = `<?xml version="1.0" encoding="UTF-8"?>\n            <rss xmlns:atom="http://www.w3.org/2005/Atom" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" version="2.0">\n            <channel>\n            <title>${xmlInfo.title.textContent}</title>\n            <link>${xmlInfo.link.textContent}</link>\n            <description>${xmlInfo.description.textContent}</description>\n            <language>${language}</language>\n            <pubDate>${xmlInfo.pubDate.textContent}</pubDate>\n            <image>\n                <url>${xmlInfo.image.url.textContent}</url>\n                <title>${xmlInfo.image.title.textContent}</title>\n                <link>${xmlInfo.image.link.textContent}</link>\n                <width>${xmlInfo.image.width.textContent}</width>\n                <height>${xmlInfo.image.height.textContent}</height>\n            </image>\n            <atom:link href="${xmlInfo[
    "atom:link"
  ].attributes.href.textContent}" rel="${xmlInfo[
    "atom:link"
  ].attributes.rel.textContent}" type="${xmlInfo[
    "atom:link"
  ].attributes.type.textContent}"></atom:link>\n            <itunes:author>${xmlInfo[
    "itunes:author"
  ].textContent}</itunes:author>\n            <itunes:summary>${xmlInfo[
    "itunes:summary"
  ].textContent}</itunes:summary>\n            <itunes:keywords>${xmlInfo[
    "itunes:keywords"
  ].textContent}</itunes:keywords>\n            <itunes:explicit>${xmlInfo[
    "itunes:explicit"
  ].textContent}</itunes:explicit>\n            <itunes:image href="${xmlInfo[
    "itunes:image"
  ].attributes.href}" />\n            <itunes:owner>\n                <itunes:name>${xmlInfo[
    "itunes:owner"
  ]["itunes:name"]}</itunes:name>\n                <itunes:email>${xmlInfo[
    "itunes:owner"
  ][
    "itunes:email"
  ]}</itunes:email>                \n            </itunes:owner>\n            <itunes:block>${xmlInfo[
    "itunes:block"
  ]}</itunes:block>\n            <itunes:category text="${xmlInfo[
    "itunes:category"
  ].attributes.text}">\n                <itunes:category text="${xmlInfo[
    "itunes:category"
  ][
    "itunes:category"
  ].attributes.text}"></itunes:category>\n            </itunes:category>`;

  for (let i = 0, len = xmlInfo.episodes.length; i < len; i++) {
    let show = xmlInfo.episodes[i];

    if (show.inactive === true) continue;

    let desc = show.description.textContent;

    xmlStr = xmlStr.concat(
      `<item>         \n                <title>${show.title.textContent}</title>\n                <description><![CDATA[${desc}]]></description>\n                <pubDate>${show.pubDate.textContent}</pubDate>\n                <enclosure url="${show.enclosure.attributes.url}" length="${show.enclosure.attributes.length}" type="${show.enclosure.attributes.type}" />\n                <guid isPermaLink="${show.guid.attributes.isPermaLink}">${show.guid.textContent}</guid>\n                <itunes:subtitle>${show[
        "itunes:subtitle"
      ].textContent}</itunes:subtitle>\n                <itunes:summary>${show[
        "itunes:summary"
      ].textContent}</itunes:summary>\n                <itunes:keywords>${show[
        "itunes:keywords"
      ].textContent}</itunes:keywords>\n                <itunes:explicit>${show[
        "itunes:explicit"
      ].textContent}</itunes:explicit>\n                <itunes:duration>${show[
        "itunes:duration"
      ].textContent}</itunes:duration>\n                </item>`
    );
  }

  xmlStr = xmlStr.concat("</channel></rss>");

  xmlStr = xmlStr.replace(/[&]/g, "&amp;");

  return xmlStr;
}