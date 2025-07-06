import { bech32 } from 'bech32';
import { BunkerInfo } from '../types';
import { hexToBytes, bytesToHex } from '../utils';

function encode(info: BunkerInfo): string {
  try {
    const encodedData: Uint8Array[] = [];

    const pubkeyBytes = hexToBytes(info.pubkey);
    encodedData.push(new Uint8Array([0, pubkeyBytes.length]));
    encodedData.push(pubkeyBytes);

    const localKeyBytes = hexToBytes(info.local_key);
    encodedData.push(new Uint8Array([1, localKeyBytes.length]));
    encodedData.push(localKeyBytes);

    for (const relay of info.relays) {
      const relayBytes = new TextEncoder().encode(relay);
      encodedData.push(new Uint8Array([2, relayBytes.length]));
      encodedData.push(relayBytes);
    }

    if (info.secret) {
      const secretBytes = new TextEncoder().encode(info.secret);
      encodedData.push(new Uint8Array([3, secretBytes.length]));
      encodedData.push(secretBytes);
    }

    const combinedLength = encodedData.reduce(
      (sum, part) => sum + part.length,
      0,
    );
    const combinedData = new Uint8Array(combinedLength);

    let offset = 0;
    for (const part of encodedData) {
      combinedData.set(part, offset);
      offset += part.length;
    }

    return bech32.encode('nbunksec', bech32.toWords(combinedData), 1000);
  } catch (error: unknown) {
    throw new Error(`Failed to encode bunker info: ${error}`);
  }
}

function decode(encoded: string): BunkerInfo {
  try {
    const { prefix, words } = bech32.decode(encoded, 1000);
    if (prefix !== 'nbunksec') {
      throw new Error(`Invalid prefix: ${prefix}`);
    }

    const data = bech32.fromWords(words);
    const bytes = new Uint8Array(data);
    
    let offset = 0;
    const info: BunkerInfo = {
      pubkey: '',
      local_key: '',
      relays: []
    };

    while (offset < bytes.length) {
      const type = bytes[offset];
      const length = bytes[offset + 1];
      offset += 2;

      const value = bytes.slice(offset, offset + length);
      offset += length;

      switch (type) {
        case 0:
          info.pubkey = bytesToHex(value);
          break;
        case 1:
          info.local_key = bytesToHex(value);
          break;
        case 2:
          info.relays.push(new TextDecoder().decode(value));
          break;
        case 3:
          info.secret = new TextDecoder().decode(value);
          break;
        default:
          throw new Error(`Unknown type: ${type}`);
      }
    }

    return info;
  } catch (error: unknown) {
    throw new Error(`Failed to decode bunker info: ${error}`);
  }
}

export const nbunksec = {
  encode,
  decode
};

export const encodeNbunksec = encode;
export const decodeNbunksec = decode;