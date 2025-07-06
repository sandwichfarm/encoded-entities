import { bech32 } from 'bech32';
import { Site } from '../types';
import { encodeVarInt, decodeVarInt } from '../utils';

export function encodeNsite(site: Site): string {
  try {
    const encodedData: Uint8Array[] = [];

    const protocolBytes = new TextEncoder().encode(site.protocol);
    encodedData.push(new Uint8Array([0]));
    encodedData.push(encodeVarInt(protocolBytes.length));
    encodedData.push(protocolBytes);

    const pathBytes = new TextEncoder().encode(site.path);
    encodedData.push(new Uint8Array([1]));
    encodedData.push(encodeVarInt(pathBytes.length));
    encodedData.push(pathBytes);

    if (site.nip !== undefined) {
      encodedData.push(new Uint8Array([2]));
      encodedData.push(encodeVarInt(site.nip));
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

    return bech32.encode('nsite', bech32.toWords(combinedData), 1000);
  } catch (error: unknown) {
    throw new Error(`Failed to encode nsite: ${error}`);
  }
}

export function decodeNsite(encoded: string): Site {
  try {
    const { prefix, words } = bech32.decode(encoded, 1000);
    if (prefix !== 'nsite') {
      throw new Error(`Invalid prefix: ${prefix}`);
    }

    const data = bech32.fromWords(words);
    const bytes = new Uint8Array(data);
    
    let offset = 0;
    const site: Site = {
      protocol: '',
      path: ''
    };

    while (offset < bytes.length) {
      const type = bytes[offset];
      offset += 1;

      switch (type) {
        case 0:
        case 1: {
          const [length, bytesRead] = decodeVarInt(bytes, offset);
          offset += bytesRead;
          const value = bytes.slice(offset, offset + length);
          offset += length;
          
          if (type === 0) {
            site.protocol = new TextDecoder().decode(value);
          } else {
            site.path = new TextDecoder().decode(value);
          }
          break;
        }
        case 2: {
          const [nip, bytesRead] = decodeVarInt(bytes, offset);
          offset += bytesRead;
          site.nip = nip;
          break;
        }
        default:
          throw new Error(`Unknown type: ${type}`);
      }
    }

    return site;
  } catch (error: unknown) {
    throw new Error(`Failed to decode nsite: ${error}`);
  }
}

export const nsite = {
  encode: encodeNsite,
  decode: decodeNsite
};