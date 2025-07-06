import { bech32 } from 'bech32';
import { NostrFilter } from '../types';
import { encodeVarInt, decodeVarInt, hexToBytes, bytesToHex } from '../utils';

export function encodeNfilter(filter: NostrFilter): string {
  try {
    const encodedData: Uint8Array[] = [];

    if (filter.ids) {
      for (const id of filter.ids) {
        encodedData.push(new Uint8Array([0]));
        const idBytes = hexToBytes(id);
        encodedData.push(new Uint8Array([idBytes.length]));
        encodedData.push(idBytes);
      }
    }

    if (filter.authors) {
      for (const author of filter.authors) {
        encodedData.push(new Uint8Array([1]));
        const authorBytes = hexToBytes(author);
        encodedData.push(new Uint8Array([authorBytes.length]));
        encodedData.push(authorBytes);
      }
    }

    if (filter.kinds) {
      for (const kind of filter.kinds) {
        encodedData.push(new Uint8Array([2]));
        encodedData.push(encodeVarInt(kind));
      }
    }

    // Removed - now handled by generic tag handler below

    if (filter.since !== undefined) {
      encodedData.push(new Uint8Array([3]));
      encodedData.push(encodeVarInt(filter.since));
    }

    if (filter.until !== undefined) {
      encodedData.push(new Uint8Array([4]));
      encodedData.push(encodeVarInt(filter.until));
    }

    if (filter.limit !== undefined) {
      encodedData.push(new Uint8Array([5]));
      encodedData.push(encodeVarInt(filter.limit));
    }

    if (filter.search) {
      encodedData.push(new Uint8Array([6]));
      const searchBytes = new TextEncoder().encode(filter.search);
      encodedData.push(encodeVarInt(searchBytes.length));
      encodedData.push(searchBytes);
    }

    // Handle all tag filters (e.g., #e, #p, #a, #d, #r, etc.)
    for (const [key, value] of Object.entries(filter)) {
      if (key.startsWith('#') && Array.isArray(value)) {
        for (const tagValue of value) {
          encodedData.push(new Uint8Array([7]));
          const keyBytes = new TextEncoder().encode(key);
          encodedData.push(new Uint8Array([keyBytes.length]));
          encodedData.push(keyBytes);
          const valueBytes = new TextEncoder().encode(String(tagValue));
          encodedData.push(encodeVarInt(valueBytes.length));
          encodedData.push(valueBytes);
        }
      }
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

    return bech32.encode('nfilter', bech32.toWords(combinedData), 1000);
  } catch (error: unknown) {
    throw new Error(`Failed to encode nfilter: ${error}`);
  }
}

export function decodeNfilter(encoded: string): NostrFilter {
  try {
    const { prefix, words } = bech32.decode(encoded, 1000);
    if (prefix !== 'nfilter') {
      throw new Error(`Invalid prefix: ${prefix}`);
    }

    const data = bech32.fromWords(words);
    const bytes = new Uint8Array(data);
    
    let offset = 0;
    const filter: NostrFilter = {};

    while (offset < bytes.length) {
      const type = bytes[offset];
      offset += 1;

      switch (type) {
        case 0: {
          const length = bytes[offset];
          offset += 1;
          const id = bytesToHex(bytes.slice(offset, offset + length));
          offset += length;
          if (!filter.ids) filter.ids = [];
          filter.ids.push(id);
          break;
        }
        case 1: {
          const length = bytes[offset];
          offset += 1;
          const author = bytesToHex(bytes.slice(offset, offset + length));
          offset += length;
          if (!filter.authors) filter.authors = [];
          filter.authors.push(author);
          break;
        }
        case 2: {
          const [kind, bytesRead] = decodeVarInt(bytes, offset);
          offset += bytesRead;
          if (!filter.kinds) filter.kinds = [];
          filter.kinds.push(kind);
          break;
        }
        case 3: {
          const [since, bytesRead] = decodeVarInt(bytes, offset);
          offset += bytesRead;
          filter.since = since;
          break;
        }
        case 4: {
          const [until, bytesRead] = decodeVarInt(bytes, offset);
          offset += bytesRead;
          filter.until = until;
          break;
        }
        case 5: {
          const [limit, bytesRead] = decodeVarInt(bytes, offset);
          offset += bytesRead;
          filter.limit = limit;
          break;
        }
        case 6: {
          const [length, bytesRead] = decodeVarInt(bytes, offset);
          offset += bytesRead;
          filter.search = new TextDecoder().decode(bytes.slice(offset, offset + length));
          offset += length;
          break;
        }
        case 7: {
          const keyLength = bytes[offset];
          offset += 1;
          const key = new TextDecoder().decode(bytes.slice(offset, offset + keyLength));
          offset += keyLength;
          const [valueLength, valueBytesRead] = decodeVarInt(bytes, offset);
          offset += valueBytesRead;
          const value = new TextDecoder().decode(bytes.slice(offset, offset + valueLength));
          offset += valueLength;
          if (!(key in filter)) (filter as any)[key] = [];
          (filter as any)[key].push(value);
          break;
        }
        default:
          throw new Error(`Unknown type: ${type}`);
      }
    }

    return filter;
  } catch (error: unknown) {
    throw new Error(`Failed to decode nfilter: ${error}`);
  }
}

export const nfilter = {
  encode: encodeNfilter,
  decode: decodeNfilter
};