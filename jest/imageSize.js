const fs = require('fs');
const path = require('path');

/** Reads pixel dimensions from a PNG or baseline/progressive JPEG header. */
function readSize(file) {
  const base = path.resolve(require.resolve('react-native/package.json'), '../jest');
  const abs = path.isAbsolute(file) ? file : path.resolve(base, file);
  const b = fs.readFileSync(abs);
  if (b.readUInt32BE(0) === 0x89504e47) return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  let o = 2;
  while (o < b.length) {
    const marker = b.readUInt16BE(o);
    const len = b.readUInt16BE(o + 2);
    if (marker >= 0xffc0 && marker <= 0xffcf && ![0xffc4, 0xffc8, 0xffcc].includes(marker)) {
      return { width: b.readUInt16BE(o + 7), height: b.readUInt16BE(o + 5) };
    }
    o += 2 + len;
  }
  throw new Error(`Unsupported image ${file}`);
}
module.exports = { readSize };
