import { bech32 } from 'bech32';
import { App } from '../types';
import { encodeVarInt, decodeVarInt, hexToBytes, bytesToHex } from '../utils';

export function encodeNapp(app: App): string {
  try {
    if (!app.relays || app.relays.length === 0) {
      throw new Error('At least one relay is required');
    }
    if (!app.servers || app.servers.length === 0) {
      throw new Error('At least one server is required');
    }
    if (!app.pubkey) {
      throw new Error('Pubkey is required');
    }
    if (!app.type) {
      throw new Error('App type is required');
    }
    if (!app.platforms || app.platforms.length === 0) {
      throw new Error('At least one platform is required');
    }

    const encodedData: Uint8Array[] = [];

    // Encode pubkey (type 0)
    const pubkeyBytes = hexToBytes(app.pubkey);
    encodedData.push(new Uint8Array([0, pubkeyBytes.length]));
    encodedData.push(pubkeyBytes);

    // Encode app type (type 1)
    const typeValue = app.type === 'web' ? 0 : 1;
    encodedData.push(new Uint8Array([1, typeValue]));

    // Encode platforms (type 2)
    for (const platform of app.platforms) {
      const platformBytes = new TextEncoder().encode(platform);
      encodedData.push(new Uint8Array([2]));
      encodedData.push(encodeVarInt(platformBytes.length));
      encodedData.push(platformBytes);
    }

    // Encode relays (type 3)
    for (const relay of app.relays) {
      const relayBytes = new TextEncoder().encode(relay);
      encodedData.push(new Uint8Array([3]));
      encodedData.push(encodeVarInt(relayBytes.length));
      encodedData.push(relayBytes);
    }

    // Encode servers (type 4)
    for (const server of app.servers) {
      const serverBytes = new TextEncoder().encode(server);
      encodedData.push(new Uint8Array([4]));
      encodedData.push(encodeVarInt(serverBytes.length));
      encodedData.push(serverBytes);
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

    return bech32.encode('napp', bech32.toWords(combinedData), 1000);
  } catch (error: unknown) {
    throw new Error(`Failed to encode napp: ${error}`);
  }
}

export function decodeNapp(encoded: string): App {
  try {
    const { prefix, words } = bech32.decode(encoded, 1000);
    if (prefix !== 'napp') {
      throw new Error(`Invalid prefix: ${prefix}`);
    }

    const data = bech32.fromWords(words);
    const bytes = new Uint8Array(data);
    
    let offset = 0;
    const app: Partial<App> = {
      platforms: [],
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
          app.pubkey = bytesToHex(bytes.slice(offset, offset + length));
          offset += length;
          break;
        }
        case 1: {
          // App type
          const typeValue = bytes[offset];
          offset += 1;
          app.type = typeValue === 0 ? 'web' : 'native';
          break;
        }
        case 2: {
          // Platform
          const [length, bytesRead] = decodeVarInt(bytes, offset);
          offset += bytesRead;
          const platform = new TextDecoder().decode(bytes.slice(offset, offset + length));
          offset += length;
          app.platforms!.push(platform);
          break;
        }
        case 3: {
          // Relay
          const [length, bytesRead] = decodeVarInt(bytes, offset);
          offset += bytesRead;
          const relay = new TextDecoder().decode(bytes.slice(offset, offset + length));
          offset += length;
          app.relays!.push(relay);
          break;
        }
        case 4: {
          // Server
          const [length, bytesRead] = decodeVarInt(bytes, offset);
          offset += bytesRead;
          const server = new TextDecoder().decode(bytes.slice(offset, offset + length));
          offset += length;
          app.servers!.push(server);
          break;
        }
        default:
          throw new Error(`Unknown type: ${type}`);
      }
    }

    // Validate required fields
    if (!app.pubkey) {
      throw new Error('Missing required pubkey field');
    }
    if (!app.type) {
      throw new Error('Missing required type field');
    }
    if (!app.platforms || app.platforms.length === 0) {
      throw new Error('At least one platform is required');
    }
    if (!app.relays || app.relays.length === 0) {
      throw new Error('At least one relay is required');
    }
    if (!app.servers || app.servers.length === 0) {
      throw new Error('At least one server is required');
    }

    return app as App;
  } catch (error: unknown) {
    throw new Error(`Failed to decode napp: ${error}`);
  }
}

export const napp = {
  encode: encodeNapp,
  decode: decodeNapp
};