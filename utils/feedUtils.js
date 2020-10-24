const moment = require("moment");
const r = require("../managers/rethinkdb");

const determineSortOrder = pod => {
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
};

const formatFeedJson = (data, show) => {
  let feedJson = {
    id: show,
    title: data.title.textContent,
    titleAbbr: show,
    description: data.description.textContent,
    image: data.image.url.textContent,
    lastModified: data.lastModified,
    sortOrder: determineSortOrder(show),
    episodes: []
  };

  for (let i = 0, len = data.episodes.length; i < len; i++) {
    let episode = data.episodes[i];
    // console.log(episode, 'EPISODE');
    let episodeObj = {
      epTitle: episode.title.textContent,
      epDescription: episode.description.textContent,
      epStreamUrl: episode.enclosure.attributes.url,
      epFileSize: episode.enclosure.attributes.length,
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
    feedJson.episodes.push(episodeObj);
  }
  return feedJson;
};

module.exports = { formatFeedJson };
