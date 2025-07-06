import { bech32 } from 'bech32';
import { Feed } from '../types';
import { encodeVarInt, decodeVarInt } from '../utils';
import { encodeNfilters, decodeNfilters } from './nfilters';

export function encodeNfeed(feed: Feed): string {
  try {
    const encodedData: Uint8Array[] = [];

    const filtersBech32 = encodeNfilters(feed.filters);
    const { words } = bech32.decode(filtersBech32, 1000);
    const filtersBytes = new Uint8Array(bech32.fromWords(words));
    
    encodedData.push(new Uint8Array([0]));
    encodedData.push(encodeVarInt(filtersBytes.length));
    encodedData.push(filtersBytes);

    for (const relay of feed.relays) {
      const relayBytes = new TextEncoder().encode(relay);
      encodedData.push(new Uint8Array([1]));
      encodedData.push(encodeVarInt(relayBytes.length));
      encodedData.push(relayBytes);
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

    return bech32.encode('nfeed', bech32.toWords(combinedData), 1000);
  } catch (error: unknown) {
    throw new Error(`Failed to encode nfeed: ${error}`);
  }
}

export function decodeNfeed(encoded: string): Feed {
  try {
    const { prefix, words } = bech32.decode(encoded, 1000);
    if (prefix !== 'nfeed') {
      throw new Error(`Invalid prefix: ${prefix}`);
    }

    const data = bech32.fromWords(words);
    const bytes = new Uint8Array(data);
    
    let offset = 0;
    const feed: Feed = {
      filters: [],
      relays: []
    };

    while (offset < bytes.length) {
      const type = bytes[offset];
      offset += 1;

      const [length, bytesRead] = decodeVarInt(bytes, offset);
      offset += bytesRead;

      switch (type) {
        case 0: {
          const filtersBytes = bytes.slice(offset, offset + length);
          offset += length;
          const filtersBech32 = bech32.encode('nfilters', bech32.toWords(filtersBytes), 1000);
          feed.filters = decodeNfilters(filtersBech32);
          break;
        }
        case 1: {
          const relay = new TextDecoder().decode(bytes.slice(offset, offset + length));
          offset += length;
          feed.relays.push(relay);
          break;
        }
        default:
          throw new Error(`Unknown type: ${type}`);
      }
    }

    return feed;
  } catch (error: unknown) {
    throw new Error(`Failed to decode nfeed: ${error}`);
  }
}

export const nfeed = {
  encode: encodeNfeed,
  decode: decodeNfeed
};