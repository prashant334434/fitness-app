#!/usr/bin/env python3
"""
Rewrites the `name` table of TTFs whose internal names don't match their file names.

The bundled Montserrat statics were exported from a variable font as "Montserrat Thin"
/ "MontserratThin-*". Android loads fonts by file name so it never noticed, but iOS
resolves `fontFamily` by PostScript name, so every Montserrat weight fell back.

    python3 scripts/fix-font-names.py android/app/src/main/assets/fonts/Montserrat-*.ttf
"""
import struct, sys

REPLACE = [('MontserratThin', 'Montserrat'), ('Montserrat Thin', 'Montserrat')]


def checksum(data):
    data += b'\0' * (-len(data) % 4)
    return sum(struct.unpack(f'>{len(data) // 4}I', data)) & 0xFFFFFFFF


def fix(path):
    b = bytearray(open(path, 'rb').read())
    num = struct.unpack('>H', b[4:6])[0]
    tables = {}
    for i in range(num):
        tag, cs, off, ln = struct.unpack('>4sIII', b[12 + 16 * i:28 + 16 * i])
        tables[tag] = (i, off, ln)
    _, no, nl = tables[b'name']
    fmt, count, so = struct.unpack('>HHH', b[no:no + 6])
    recs, strings = [], b''
    for i in range(count):
        pid, eid, lid, nid, ln, of = struct.unpack('>6H', b[no + 6 + 12 * i:no + 18 + 12 * i])
        raw = bytes(b[no + so + of:no + so + of + ln])
        enc = 'utf-16-be' if pid in (0, 3) else 'mac_roman'
        s = raw.decode(enc)
        for a, z in REPLACE:
            s = s.replace(a, z)
        raw = s.encode(enc)
        recs.append((pid, eid, lid, nid, len(raw), len(strings)))
        strings += raw
    table = struct.pack('>HHH', 0, count, 6 + 12 * count) + b''.join(struct.pack('>6H', *r) for r in recs) + strings
    # append the new name table at the end of the file and repoint the directory entry
    end = len(b) + (-len(b) % 4)
    b += b'\0' * (end - len(b))
    idx = tables[b'name'][0]
    struct.pack_into('>4sIII', b, 12 + 16 * idx, b'name', checksum(table), end, len(table))
    b += table + b'\0' * (-len(table) % 4)
    # head.checkSumAdjustment
    _, ho, _ = tables[b'head']
    struct.pack_into('>I', b, ho + 8, 0)
    struct.pack_into('>I', b, ho + 8, (0xB1B0AFBA - checksum(bytes(b))) & 0xFFFFFFFF)
    open(path, 'wb').write(b)
    print('fixed', path)


for p in sys.argv[1:]:
    fix(p)
