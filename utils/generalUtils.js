const crypto = require("crypto");

//////////

const uidGen = n => {
  let r = "";
  while (n--)
    r += String.fromCharCode(
      ((r = (Math.random() * 62) | 0), (r += r > 9 ? (r < 36 ? 55 : 61) : 48))
    );
  return r;
};

const randomBytes = n => {
  console.log("Getting random bytes");
  const str = crypto.randomBytes(n).toString('hex');
    // if (err) throw err;
    // console.log(`${buf.length} bytes of random data: ${buf.toString("hex")}`);
    // return buf.toString("hex");
//   });
    return str;
};

module.exports = { uidGen, randomBytes };
