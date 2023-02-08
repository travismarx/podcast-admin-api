const express = require("express");
const router = express.Router();
const request = require("request");
const axios = require("axios");

const { interval, from } = require("rxjs");
const { switchMap, takeWhile, tap, finalize } = require("rxjs/operators");

let serverInfo = null;
let watching = false;

const resizeUrl = "https://api.linode.com/v4/linode/instances/2673153/resize";
const bootUrl = "https://api.linode.com/v4/linode/instances/2673153/boot";
const linodeStatusUrl = "https://api.linode.com/v4/linode/instances/2673153";
const authHeader = {
  Authorization: `Bearer ${process.env.LINODE_TOKEN}`,
};

const infoOptions = {
  headers: authHeader,
};

const streamType = "g6-standard-16";
const idleType = "g6-nanode-1";

const onOptions = {
  form: {
    type: streamType,
    allow_auto_disk_resize: false,
  },
  headers: authHeader,
};
const offOptions = {
  body: { type: idleType, allow_auto_disk_resize: false },
  headers: authHeader,
};

const poll = (fetchFn, isSuccessFn, pollInterval = 5000) => {
  // console.log("Starting poll");
  return interval(pollInterval).pipe(
    switchMap(() => from(fetchFn)),
    takeWhile((response) => isSuccessFn(response))
  );
};

const watchServerInfo = () => {
  let initialState = null;
  watching = true;

  poll(axios.get(linodeStatusUrl, infoOptions), (info) => info)
    .pipe(
      tap((response) => {
        if (!initialState) initialState = response.data;
        if (response.data.status === "offline") sendBootCmd();
        serverInfo = response.data;
        // console.log(response.data.status, "response status from polling");
      }),
      takeWhile((response) => {
        return response.data.status !== "running";
      }),
      finalize(() => {
        // console.log("Subscription complete");
      })
    )
    .subscribe();
};

const get = (req, res) => {
  // if (watching && serverInfo) {
  //   console.log("watching, get local");
  //   res.send(serverInfo);
  // } else {
  // console.log("Not watching, make request");
  return request.get(linodeStatusUrl, infoOptions, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      const info = JSON.parse(body);
      if (info.status === "offline") sendBootCmd();
      res.send(info);
    }
  });
  // }
};

const getServerInfo = (cb) => {
  request.get(linodeStatusUrl, infoOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const info = JSON.parse(body);
      if (info.status === "offline") {
        sendBootCmd();
      }
      // if (info.status === "resizing" || info.status === "booting") {
      //   watchServerInfo();
      // }
    }
    cb(error, response, body);
  });
};

const sendBootCmd = () => {
  // console.log("Sending boot command");
  request.post({ url: bootUrl, headers: authHeader });
};

const sendResizeCmd = (type, cb) => {
  request.post(
    { url: resizeUrl, headers: authHeader, json: { type: type, allow_auto_disk_resize: true } },
    (error, response, body) => {
      if (error) return cb({ OK: false });
      if (!error && response.statusCode === 200) {
        // watchServerInfo();
      }
    }
  );
};

const turnServerOn = (req, res) => {
  // console.log("Turn on server");
  res.send({ OK: true });
  getServerInfo((error, response, body) => {
    if (error) {
      res.send(error);
    } else if (!error && response.statusCode == 200) {
      const info = JSON.parse(body);

      if (info.type !== streamType) {
        sendResizeCmd(streamType);
      }
    }
  });
};

const turnServerOff = (req, res) => {
  // console.log("Turn server OFF");
  res.send({ OK: true });
  getServerInfo((error, response, body) => {
    if (error) {
      res.send(error);
    } else if (!error && response.statusCode == 200) {
      const info = JSON.parse(body);

      if (info.type !== idleType) {
        sendResizeCmd(idleType);
      }
    }
  });
};

////////////////////

router.route("/").get(get);
router.route("/on").post(turnServerOn);
router.route("/off").post(turnServerOff);

module.exports = router;
