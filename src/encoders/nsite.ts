import { bech32 } from 'bech32';
import { Site } from '../types';
import { encodeVarInt, decodeVarInt, hexToBytes, bytesToHex } from '../utils';

export function encodeNsite(site: Site): string {
  try {
    if (!site.relays || site.relays.length === 0) {
      throw new Error('At least one relay is required');
    }
    if (!site.servers || site.servers.length === 0) {
      throw new Error('At least one server is required');
    }
    if (!site.pubkey) {
      throw new Error('Pubkey is required');
    }

    const encodedData: Uint8Array[] = [];

    // Encode pubkey (type 0)
    const pubkeyBytes = hexToBytes(site.pubkey);
    encodedData.push(new Uint8Array([0, pubkeyBytes.length]));
    encodedData.push(pubkeyBytes);

    // Encode relays (type 1)
    for (const relay of site.relays) {
      const relayBytes = new TextEncoder().encode(relay);
      encodedData.push(new Uint8Array([1]));
      encodedData.push(encodeVarInt(relayBytes.length));
      encodedData.push(relayBytes);
    }

    // Encode servers (type 2)
    for (const server of site.servers) {
      const serverBytes = new TextEncoder().encode(server);
      encodedData.push(new Uint8Array([2]));
      encodedData.push(encodeVarInt(serverBytes.length));
      encodedData.push(serverBytes);
    }

    // No additional fields - keep encoding minimal

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
    const site: Partial<Site> = {
      relays: [],
      servers: []
    };

    while (offset < bytes.length) {
      const type = bytes[offset];
      offset += 1;

      switch (type) {
        case 0: {
          // Pubkey
          const length = bytes[offset];
          offset += 1;
          site.pubkey = bytesToHex(bytes.slice(offset, offset + length));
          offset += length;
          break;
        }
        case 1: {
          // Relay
          const [length, bytesRead] = decodeVarInt(bytes, offset);
          offset += bytesRead;
          const relay = new TextDecoder().decode(bytes.slice(offset, offset + length));
          offset += length;
          site.relays!.push(relay);
          break;
        }
        case 2: {
          // Server
          const [length, bytesRead] = decodeVarInt(bytes, offset);
          offset += bytesRead;
          const server = new TextDecoder().decode(bytes.slice(offset, offset + length));
          offset += length;
          site.servers!.push(server);
          break;
        }
        default:
          throw new Error(`Unknown type: ${type}`);
      }
    }

    // Validate required fields
    if (!site.pubkey) {
      throw new Error('Missing required pubkey field');
    }
    if (!site.relays || site.relays.length === 0) {
      throw new Error('At least one relay is required');
    }
    if (!site.servers || site.servers.length === 0) {
      throw new Error('At least one server is required');
    }

    return site as Site;
  } catch (error: unknown) {
    throw new Error(`Failed to decode nsite: ${error}`);
  }
}

export const nsite = {
  encode: encodeNsite,
  decode: decodeNsite
};