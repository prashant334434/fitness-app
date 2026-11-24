/// <reference types="node" />
/**
 * iOS resolves `fontFamily` by PostScript name, Android by file name. If the two
 * disagree, iOS silently falls back to another face (this shipped once: the
 * Montserrat statics were named "MontserratThin-*"). These tests pin the contract.
 */
import fs from 'fs';
import path from 'path';
import { F } from '../src/theme';

const ROOT = path.join(__dirname, '..');
const FONT_DIR = path.join(ROOT, 'android/app/src/main/assets/fonts');
const fonts: string[] = fs.readdirSync(FONT_DIR).filter((f: string) => f.endsWith('.ttf'));

function postScriptName(file: string) {
  const b = fs.readFileSync(path.join(FONT_DIR, file));
  const n = b.readUInt16BE(4);
  let off = -1;
  for (let i = 0; i < n; i++) {
    if (b.toString('latin1', 12 + 16 * i, 16 + 16 * i) === 'name') off = b.readUInt32BE(20 + 16 * i);
  }
  const count = b.readUInt16BE(off + 2);
  const store = off + b.readUInt16BE(off + 4);
  for (let i = 0; i < count; i++) {
    const r = off + 6 + 12 * i;
    if (b.readUInt16BE(r) === 3 && b.readUInt16BE(r + 6) === 6) {
      const s = b.subarray(store + b.readUInt16BE(r + 10), store + b.readUInt16BE(r + 10) + b.readUInt16BE(r + 8));
      return Buffer.from(s).swap16().toString('utf16le');
    }
  }
  return undefined;
}

describe('bundled fonts', () => {
  it.each(fonts)('%s has a PostScript name equal to its file name', (file: string) => {
    expect(postScriptName(file)).toBe(file.replace(/\.ttf$/, ''));
  });

  it('every theme font family is bundled for Android', () => {
    for (const family of Object.values(F)) expect(fonts).toContain(`${family}.ttf`);
  });

  it('every theme font family is registered for iOS (UIAppFonts + Copy Bundle Resources)', () => {
    const plist = fs.readFileSync(path.join(ROOT, 'ios/FitnessApp/Info.plist'), 'utf8');
    const pbx = fs.readFileSync(path.join(ROOT, 'ios/FitnessApp.xcodeproj/project.pbxproj'), 'utf8');
    for (const family of Object.values(F)) {
      expect(plist).toContain(`<string>${family}.ttf</string>`);
      expect(pbx).toContain(`/* ${family}.ttf in Resources */`);
    }
  });
});
