const fs = require("fs");

const inspectFile = (path) => {
  try {
    const buf = fs.readFileSync(path);
    console.log(`--- ${path} (Size: ${buf.length}) ---`);
    console.log("Hex:  ", buf.subarray(0, 32).toString("hex"));
    console.log("ASCII:", buf.subarray(0, 32).toString("ascii").replace(/[^\x20-\x7E]/g, "."));
  } catch (err) {
    console.error(err);
  }
};

inspectFile("public/models/character.glb");
inspectFile("public/models/character.enc");
