(function (global) {
  const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$*+-:";
  const base = alphabet.length;
  const marker = "C";

  function encodeBase41(bytes) {
    let output = "";

    for (let index = 0; index < bytes.length; index += 2) {
      if (index + 1 < bytes.length) {
        let value = bytes[index] * 256 + bytes[index + 1];
        output += alphabet[value % base];
        value = Math.floor(value / base);
        output += alphabet[value % base];
        value = Math.floor(value / base);
        output += alphabet[value];
      } else {
        let value = bytes[index];
        output += alphabet[value % base];
        value = Math.floor(value / base);
        output += alphabet[value];
      }
    }

    return output;
  }

  function decodeBase41(payload) {
    const bytes = [];

    for (let index = 0; index < payload.length;) {
      const remaining = payload.length - index;

      if (remaining === 2) {
        const first = alphabet.indexOf(payload[index]);
        const second = alphabet.indexOf(payload[index + 1]);

        if (first < 0 || second < 0) throw new Error("Invalid short link payload.");

        const value = first + second * base;
        if (value > 255) throw new Error("Invalid short link payload.");

        bytes.push(value);
        index += 2;
      } else {
        const first = alphabet.indexOf(payload[index]);
        const second = alphabet.indexOf(payload[index + 1]);
        const third = alphabet.indexOf(payload[index + 2]);

        if (first < 0 || second < 0 || third < 0) throw new Error("Invalid short link payload.");

        const value = first + second * base + third * base * base;
        if (value > 65535) throw new Error("Invalid short link payload.");

        bytes.push(value >> 8, value & 255);
        index += 3;
      }
    }

    return new Uint8Array(bytes);
  }

  function packCodes(codes) {
    const output = [codes.length >> 8, codes.length & 255];
    let buffer = 0;
    let bits = 0;

    codes.forEach((code) => {
      buffer = (buffer << 12) | code;
      bits += 12;

      while (bits >= 8) {
        bits -= 8;
        output.push((buffer >> bits) & 255);
      }
    });

    if (bits > 0) {
      output.push((buffer << (8 - bits)) & 255);
    }

    return new Uint8Array(output);
  }

  function unpackCodes(bytes) {
    const count = (bytes[0] << 8) | bytes[1];
    const codes = [];
    let buffer = 0;
    let bits = 0;

    for (let index = 2; index < bytes.length && codes.length < count; index += 1) {
      buffer = (buffer << 8) | bytes[index];
      bits += 8;

      while (bits >= 12 && codes.length < count) {
        bits -= 12;
        codes.push((buffer >> bits) & 4095);
        buffer &= (1 << bits) - 1;
      }
    }

    if (codes.length !== count) throw new Error("Invalid short link payload.");

    return codes;
  }

  function compressBytes(bytes) {
    const dictionary = new Map();

    for (let index = 0; index < 256; index += 1) {
      dictionary.set(String.fromCharCode(index), index);
    }

    let phrase = "";
    let dictionarySize = 256;
    const codes = [];

    bytes.forEach((byte) => {
      const character = String.fromCharCode(byte);
      const nextPhrase = phrase + character;

      if (dictionary.has(nextPhrase)) {
        phrase = nextPhrase;
      } else {
        if (phrase) codes.push(dictionary.get(phrase));
        if (dictionarySize < 4096) {
          dictionary.set(nextPhrase, dictionarySize);
          dictionarySize += 1;
        }
        phrase = character;
      }
    });

    if (phrase) codes.push(dictionary.get(phrase));

    return packCodes(codes);
  }

  function decompressBytes(bytes) {
    const codes = unpackCodes(bytes);
    const dictionary = Array.from({ length: 256 }, (_, index) => [index]);

    if (!codes.length) return new Uint8Array();

    let previous = dictionary[codes[0]].slice();
    const output = previous.slice();
    let dictionarySize = 256;

    for (let index = 1; index < codes.length; index += 1) {
      const code = codes[index];
      let entry;

      if (dictionary[code]) {
        entry = dictionary[code].slice();
      } else if (code === dictionarySize) {
        entry = previous.concat(previous[0]);
      } else {
        throw new Error("Invalid short link payload.");
      }

      output.push(...entry);

      if (dictionarySize < 4096) {
        dictionary[dictionarySize] = previous.concat(entry[0]);
        dictionarySize += 1;
      }

      previous = entry;
    }

    return new Uint8Array(output);
  }

  function encodeUrl(url) {
    const bytes = new TextEncoder().encode(String(url));
    return marker + encodeBase41(compressBytes(bytes));
  }

  function decodePayload(payload) {
    const cleanPayload = String(payload || "").trim().toUpperCase();

    if (!cleanPayload.startsWith(marker)) {
      throw new Error("Invalid short link payload.");
    }

    const bytes = decodeBase41(cleanPayload.slice(marker.length));
    return new TextDecoder().decode(decompressBytes(bytes));
  }

  global.PanShortLink = {
    encodeUrl,
    decodePayload
  };
})(window);
