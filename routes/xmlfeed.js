const express = require("express");
const router = express.Router();
const moment = require("moment");
const r = require("../managers/rethinkdb");
const utils = require("../utils/feedUtils");
// const Redis       = require('redis');
// const redis       = Redis.createClient();
// const redis = require('../lib/redis');

const get = async (req, res) => {
  console.log("Getting xml feed");
  let pod = req.params.pod;

  const xmlFeed = await r
    .table("xmlfeeds")
    .get(pod)
    .run();
  xmlFeed ? res.send(xmlFeed) : res.sendStatus(204);
  // rdb
  //   .get("xmlfeeds", pod)
  //   .then(response => (response ? res.send(response.data) : res.sendStatus(204)))
  //   .catch(err => res.send(err));
  // })
};

const post = async (req, res) => {
  console.log("POST: xmlfeed");
  let show = req.params.pod;
  let data = req.body;
  // data.episodes = data.episodes.map(ep => {
  //   if (!ep.uid) ep.uid = r.uuid();
  // });
  for (let i = 0; i < data.episodes.length; i++) {
    const ep = data.episodes[i];
    if (!ep.uid) data.episodes[i].uid = await r.uuid();
  }
  if (!data.inactiveEpisodes) data.inactiveEpisodes = [];
  let xmlFeedObj = Object.assign({}, { id: show, data: data });

  try {
    const replace = await r
      .table("xmlfeeds")
      .insert(xmlFeedObj, { conflict: "replace" })
      .run();

    if (replace.errors) return res.sendStatus(204);
  } catch (err) {
    console.log(err, "error caught in replace");
  }

  const timestamp = moment().format("YYMMDD_HHmmss");
  const idStr = `${show}_${timestamp}`;

  const insertHistory = await r
    .table("xmlfeedshistory")
    .insert({ id: timestamp, showId: show, data: data })
    .run();
  if (insertHistory.errors) return res.sendStatus(204);
  const apiFeed = utils.formatFeedJson(data, show);
  const insertApiFeed = await r.table("feeds").insert(apiFeed, { conflict: "replace" });

  console.log(insertApiFeed, "inserted api feed");

  if (!insertApiFeed.errors) return res.sendStatus(204);
  res.sendStatus(200);
  //   rdb
  //     .insert("xmlfeeds", xmlFeedObj, "replace")
  //     .then(resp1 => {
  //       if (!resp1.errors) {
  //         // redis.set(`xmlfeed::${show}`, JSON.stringify(xmlFeedObj.data));
  //         rdb
  //           .insert("xmlfeedshistory", { id: `${show}_${moment().format("YYMMDD_HHmmss")}`, data: data })
  //           .then(resp2 => {
  //             if (resp2.inserted === 1) {
  //               let apiPodFeed = utils.formatFeedJson(data, show);
  //               rdb
  //                 .insert("feeds", apiPodFeed, "replace")
  //                 .then(resp3 => {
  //                   // redis.set(`showfeed::${show}`, JSON.stringify(apiPodFeed));
  //                   !resp3.errors ? res.sendStatus(200) : res.sendStatus(400);
  //                 });
  //               } else {
  //                 res.sendStatus(409);
  //               }
  //             });
  //         } else {
  //           res.sendStatus(409);
  //         }
  //       })
  //     .catch(err => {
  //       res.send(err);
  //     });
};

router
  .route("/:pod?")
  .get(get)
  .post(post);

//////////

module.exports = router;

/*
 * HELPERS
 */

function formatFeedJson(data, show) {
  let feedJson = {
    id: show,
    title: data.title.textContent,
    titleAbbr: show,
    description: data.description.textContent,
    image: data.image.url.textContent,
    lastModified: data.lastModified,
    sortOrder: determineSort(show),
    episodes: []
    // inactiveEpisodes: []
  };

  for (let i = 0, len = data.episodes.length; i < len; i++) {
    let episode = data.episodes[i];

    let episodeObj = {
      epTitle: episode.title.textContent,
      epDescription: episode.description.textContent,
      epStreamUrl: episode.enclosure.attributes.url,
      epFileSize: episode.enclosure.attributes.length,
      // epFileSizeMB: episode.enclosure.attributes.length).replace((/,/g, ""), 10)) / 1048576,
      epFileSizeMB: (
        parseInt(episode.enclosure.attributes.length.replace(/,/g, "")) /
        1024 /
        1024
      ).toFixed(2),
      epDate: episode.pubDate.textContent,
      epPodTitle: feedJson.title,
      epPodTitleAbbr: show,
      epPodImage: data.image.url.textContent,
      epIndex: i,
      lastModified: episode.lastModified || moment().format("X"),
      uid: episode.uid ? episode.uid : r.uuid()
    };
    // if (episode.inactive === true) episodeObj.inactive = true;
    // episodeObj.lastModified = episodeObj.lastModified ? episodeObj.lastModified : moment().format('x');

    // !episodeObj.inactive ?
    //   feedJson.episodes.push(episodeObj) :
    //   feedJson.inactiveEpisodes.push(episodeObj);
    feedJson.episodes.push(episodeObj);
  }

  return feedJson;
}

function determineSort(pod) {
  switch (pod) {
    case "pulpmx":
      return 1;
    case "steveshow":
      return 2;
    case "moto60":
      return 3;
    case "keefer":
      return 4;
    case "shiftinggears":
      return 5;
    case "industryseating":
      return 6;
    case "exclusives":
      return 7;
    case "classics3":
      return 8;
    case "classics2":
      return 9;
    case "classics1":
      return 10;
    case "hockey":
      return 11;
  }
}

function hashGen(n) {
  let r = "";
  while (n--)
    r += String.fromCharCode(
      ((r = (Math.random() * 62) | 0), (r += r > 9 ? (r < 36 ? 55 : 61) : 48))
    );
  return r;
}
