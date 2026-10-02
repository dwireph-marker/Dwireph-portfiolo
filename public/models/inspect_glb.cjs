const fs = require("fs");

try {
  const buf = fs.readFileSync("public/models/character.glb");
  console.log("File size:", buf.length);
  if (buf.length < 12) {
    console.log("File is too short!");
  } else {
    const magic = buf.toString("ascii", 0, 4);
    const version = buf.readUInt32LE(4);
    const totalLength = buf.readUInt32LE(8);
    console.log("Magic:", magic);
    console.log("Version:", version);
    console.log("Header Total Length:", totalLength);
    
    // Check first chunk
    if (buf.length >= 20) {
      const chunkLength = buf.readUInt32LE(12);
      const chunkType = buf.toString("ascii", 16, 20);
      console.log("First Chunk Length:", chunkLength);
      console.log("First Chunk Type:", chunkType);
    }
  }
} catch (error) {
  console.error("Error:", error);
}
