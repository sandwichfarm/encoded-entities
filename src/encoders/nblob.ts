import { bech32 } from 'bech32';
import { Blob } from '../types';
import { encodeVarInt, decodeVarInt, hexToBytes, bytesToHex } from '../utils';

export function encodeNblob(blob: Blob): string {
  try {
    if (!blob.hash) {
      throw new Error('Hash is required');
    }
    if (!blob.servers || blob.servers.length === 0) {
      throw new Error('At least one server is required');
    }
    if (!blob.pubkey) {
      throw new Error('Pubkey is required');
    }

    const encodedData: Uint8Array[] = [];

    // Encode pubkey (type 0)
    const pubkeyBytes = hexToBytes(blob.pubkey);
    encodedData.push(new Uint8Array([0, pubkeyBytes.length]));
    encodedData.push(pubkeyBytes);

    // Encode hash (type 1)
    const hashBytes = hexToBytes(blob.hash);
    encodedData.push(new Uint8Array([1, hashBytes.length]));
    encodedData.push(hashBytes);

    // Encode servers (type 2)
    for (const server of blob.servers) {
      const serverBytes = new TextEncoder().encode(server);
      encodedData.push(new Uint8Array([2]));
      encodedData.push(encodeVarInt(serverBytes.length));
      encodedData.push(serverBytes);
    }

    // Encode path if present (type 3)
    if (blob.path) {
      const pathBytes = new TextEncoder().encode(blob.path);
      encodedData.push(new Uint8Array([3]));
      encodedData.push(encodeVarInt(pathBytes.length));
      encodedData.push(pathBytes);
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

    return bech32.encode('nblob', bech32.toWords(combinedData), 1000);
  } catch (error: unknown) {
    throw new Error(`Failed to encode nblob: ${error}`);
  }
}

export function decodeNblob(encoded: string): Blob {
  try {
    const { prefix, words } = bech32.decode(encoded, 1000);
    if (prefix !== 'nblob') {
      throw new Error(`Invalid prefix: ${prefix}`);
    }

    const data = bech32.fromWords(words);
    const bytes = new Uint8Array(data);
    
    let offset = 0;
    const blob: Partial<Blob> = {
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
          blob.pubkey = bytesToHex(bytes.slice(offset, offset + length));
          offset += length;
          break;
        }
        case 1: {
          // Hash
          const length = bytes[offset];
          offset += 1;
          blob.hash = bytesToHex(bytes.slice(offset, offset + length));
          offset += length;
          break;
        }
        case 2: {
          // Server
          const [length, bytesRead] = decodeVarInt(bytes, offset);
          offset += bytesRead;
          const server = new TextDecoder().decode(bytes.slice(offset, offset + length));
          offset += length;
          blob.servers!.push(server);
          break;
        }
        case 3: {
          // Path
          const [length, bytesRead] = decodeVarInt(bytes, offset);
          offset += bytesRead;
          blob.path = new TextDecoder().decode(bytes.slice(offset, offset + length));
          offset += length;
          break;
        }
        default:
          throw new Error(`Unknown type: ${type}`);
      }
    }

    // Validate required fields
    if (!blob.pubkey) {
      throw new Error('Missing required pubkey field');
    }
    if (!blob.hash) {
      throw new Error('Missing required hash field');
    }
    if (!blob.servers || blob.servers.length === 0) {
      throw new Error('At least one server is required');
    }

    return blob as Blob;
  } catch (error: unknown) {
    throw new Error(`Failed to decode nblob: ${error}`);
  }
}

export const nblob = {
  encode: encodeNblob,
  decode: decodeNblob
};