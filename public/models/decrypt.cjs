const crypto = require("crypto");
const fs = require("fs");

const decryptFile = (inputFile, outputFile, password) => {
  const key = crypto.createHash("sha256").update(password).digest();
  
  const input = fs.readFileSync(inputFile);
  const iv = input.subarray(0, 16);
  const encryptedData = input.subarray(16);

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);

  fs.writeFileSync(outputFile, decrypted);
  console.log(`Successfully decrypted ${inputFile} to ${outputFile}`);
};

try {
  decryptFile("public/models/character.glb", "public/models/test_decrypted.glb", "Character3D#@");
} catch (error) {
  console.error("Decryption failed:", error);
}
