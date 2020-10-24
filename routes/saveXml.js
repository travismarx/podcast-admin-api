const fs = require("fs");
const express = require("express");
const router = express.Router();
const FILE_LOCATIONS = require("../utils/constants");

//////////

router.route("/").post((req, res) => {
  console.log("saving xml");
  let show = req.query.show;
  let xmlName = req.query.xmlName;
  let newStr = jsonToXML(req.body);

  fs.writeFile(`${FILE_LOCATIONS.admin}xml/${xmlName}.xml`, newStr, err => {
    if (err) {
      return res.send(err);
    }

    fs.writeFile(`/home/pulpmx/www/apptabs/${xmlName}.xml`, newStr, err => {
      if (err) {
        return err;
      }
    });
    // return res.send({
    //   status: 1
    // });

    // console.log('File saved');
    res.send({
      status: 1
    });
  });
});

function jsonToXML(xmlInfo) {
  const language = "EN";

  let xmlStr = `<?xml version="1.0" encoding="UTF-8"?>\n            <rss xmlns:atom="http://www.w3.org/2005/Atom" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" version="2.0">\n            <channel>\n            <title>${
    xmlInfo.title.textContent
  }</title>\n            <link>${xmlInfo.link.textContent}</link>\n            <description>${
    xmlInfo.description.textContent
  }</description>\n            <language>${language}</language>\n            <pubDate>${
    xmlInfo.pubDate.textContent
  }</pubDate>\n            <image>\n                <url>${
    xmlInfo.image.url.textContent
  }</url>\n                <title>${
    xmlInfo.image.title.textContent
  }</title>\n                <link>${
    xmlInfo.image.link.textContent
  }</link>\n                <width>${
    xmlInfo.image.width.textContent
  }</width>\n                <height>${
    xmlInfo.image.height.textContent
  }</height>\n            </image>\n            <atom:link href="${
    xmlInfo["atom:link"].attributes.href.textContent
  }" rel="${xmlInfo["atom:link"].attributes.rel.textContent}" type="${
    xmlInfo["atom:link"].attributes.type.textContent
  }"></atom:link>\n            <itunes:author>${
    xmlInfo["itunes:author"].textContent
  }</itunes:author>\n            <itunes:summary>${
    xmlInfo["itunes:summary"].textContent
  }</itunes:summary>\n            <itunes:keywords>${
    xmlInfo["itunes:keywords"].textContent
  }</itunes:keywords>\n            <itunes:explicit>${
    xmlInfo["itunes:explicit"].textContent
  }</itunes:explicit>\n            <itunes:image href="${
    xmlInfo["itunes:image"].attributes.href
  }" />\n            <itunes:owner>\n                <itunes:name>${
    xmlInfo["itunes:owner"]["itunes:name"]
  }</itunes:name>\n                <itunes:email>${
    xmlInfo["itunes:owner"]["itunes:email"]
  }</itunes:email>                \n            </itunes:owner>\n            <itunes:block>${
    xmlInfo["itunes:block"]
  }</itunes:block>\n            <itunes:category text="${
    xmlInfo["itunes:category"].attributes.text
  }">\n                <itunes:category text="${
    xmlInfo["itunes:category"]["itunes:category"].attributes.text
  }"></itunes:category>\n            </itunes:category>`;

  for (let i = 0, len = xmlInfo.episodes.length; i < len; i++) {
    let show = xmlInfo.episodes[i];

    // if (show.inactive === true) continue;

    let desc = show.description.textContent;

    xmlStr = xmlStr.concat(
      `<item>         \n                <title>${show.title.textContent}</title>\n                <description><![CDATA[${desc}]]></description>\n                <pubDate>${show.pubDate.textContent}</pubDate>\n                <enclosure url="${show.enclosure.attributes.url}" length="${show.enclosure.attributes.length}" type="${show.enclosure.attributes.type}" />\n                <guid isPermaLink="${show.guid.attributes.isPermaLink}">${show.guid.textContent}</guid>\n                <itunes:subtitle>${show["itunes:subtitle"].textContent}</itunes:subtitle>\n                <itunes:summary>${show["itunes:summary"].textContent}</itunes:summary>\n                <itunes:keywords>${show["itunes:keywords"].textContent}</itunes:keywords>\n                <itunes:explicit>${show["itunes:explicit"].textContent}</itunes:explicit>\n                <itunes:duration>${show["itunes:duration"].textContent}</itunes:duration>\n                </item>`
    );
  }

  xmlStr = xmlStr.concat("</channel></rss>");

  xmlStr = xmlStr.replace(/[&]/g, "&amp;");

  return xmlStr;
}

module.exports = router;
