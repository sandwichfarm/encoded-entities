import { bech32 } from 'bech32';
import { NostrFilter } from '../types';
import { encodeNfilter, decodeNfilter } from './nfilter';

export function encodeNfilters(filters: NostrFilter[]): string {
  try {
    const encodedData: Uint8Array[] = [];

    for (const filter of filters) {
      const filterBech32 = encodeNfilter(filter);
      const { words } = bech32.decode(filterBech32, 1000);
      const filterBytes = new Uint8Array(bech32.fromWords(words));
      
      encodedData.push(new Uint8Array([0]));
      encodedData.push(new Uint8Array([filterBytes.length >> 8, filterBytes.length & 0xff]));
      encodedData.push(filterBytes);
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

    return bech32.encode('nfilters', bech32.toWords(combinedData), 1000);
  } catch (error: unknown) {
    throw new Error(`Failed to encode nfilters: ${error}`);
  }
}

export function decodeNfilters(encoded: string): NostrFilter[] {
  try {
    const { prefix, words } = bech32.decode(encoded, 1000);
    if (prefix !== 'nfilters') {
      throw new Error(`Invalid prefix: ${prefix}`);
    }

    const data = bech32.fromWords(words);
    const bytes = new Uint8Array(data);
    
    let offset = 0;
    const filters: NostrFilter[] = [];

    while (offset < bytes.length) {
      const type = bytes[offset];
      if (type !== 0) {
        throw new Error(`Unknown type: ${type}`);
      }
      offset += 1;

      const length = (bytes[offset] << 8) | bytes[offset + 1];
      offset += 2;

      const filterBytes = bytes.slice(offset, offset + length);
      offset += length;

      const filterBech32 = bech32.encode('nfilter', bech32.toWords(filterBytes), 1000);
      const filter = decodeNfilter(filterBech32);
      filters.push(filter);
    }

    return filters;
  } catch (error: unknown) {
    throw new Error(`Failed to decode nfilters: ${error}`);
  }
}

export const nfilters = {
  encode: encodeNfilters,
  decode: decodeNfilters
};