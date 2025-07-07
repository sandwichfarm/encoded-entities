import { bech32 } from 'bech32';
import { Invite } from '../types';
import { encodeVarInt, decodeVarInt, hexToBytes, bytesToHex } from '../utils';

export function encodeNvite(invite: Invite): string {
  try {
    if (!invite.relays || invite.relays.length === 0) {
      throw new Error('At least one relay is required');
    }
    if (!invite.invitor_pubkey) {
      throw new Error('Invitor pubkey is required');
    }

    const encodedData: Uint8Array[] = [];

    // Encode invitor pubkey (type 0)
    const invitorPubkeyBytes = hexToBytes(invite.invitor_pubkey);
    encodedData.push(new Uint8Array([0, invitorPubkeyBytes.length]));
    encodedData.push(invitorPubkeyBytes);

    // Encode relays (type 1)
    for (const relay of invite.relays) {
      const relayBytes = new TextEncoder().encode(relay);
      encodedData.push(new Uint8Array([1]));
      encodedData.push(encodeVarInt(relayBytes.length));
      encodedData.push(relayBytes);
    }

    // Encode pubkeys (type 2)
    if (invite.pubkeys) {
      for (const pubkey of invite.pubkeys) {
        const pubkeyBytes = hexToBytes(pubkey);
        encodedData.push(new Uint8Array([2, pubkeyBytes.length]));
        encodedData.push(pubkeyBytes);
      }
    }

    // Encode nsites (type 3)
    if (invite.nsites) {
      for (const nsite of invite.nsites) {
        const nsiteBytes = new TextEncoder().encode(nsite);
        encodedData.push(new Uint8Array([3]));
        encodedData.push(encodeVarInt(nsiteBytes.length));
        encodedData.push(nsiteBytes);
      }
    }

    // Encode napp_pubkeys (type 4)
    if (invite.napp_pubkeys) {
      for (const appPubkey of invite.napp_pubkeys) {
        const appPubkeyBytes = hexToBytes(appPubkey);
        encodedData.push(new Uint8Array([4, appPubkeyBytes.length]));
        encodedData.push(appPubkeyBytes);
      }
    }

    // Encode follow_packs (type 5)
    if (invite.follow_packs) {
      for (const followPack of invite.follow_packs) {
        const followPackBytes = new TextEncoder().encode(followPack);
        encodedData.push(new Uint8Array([5]));
        encodedData.push(encodeVarInt(followPackBytes.length));
        encodedData.push(followPackBytes);
      }
    }

    // Encode invitee_name if present (type 6)
    if (invite.invitee_name) {
      const nameBytes = new TextEncoder().encode(invite.invitee_name);
      encodedData.push(new Uint8Array([6]));
      encodedData.push(encodeVarInt(nameBytes.length));
      encodedData.push(nameBytes);
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

    return bech32.encode('nvite', bech32.toWords(combinedData), 1000);
  } catch (error: unknown) {
    throw new Error(`Failed to encode nvite: ${error}`);
  }
}

export function decodeNvite(encoded: string): Invite {
  try {
    const { prefix, words } = bech32.decode(encoded, 1000);
    if (prefix !== 'nvite') {
      throw new Error(`Invalid prefix: ${prefix}`);
    }

    const data = bech32.fromWords(words);
    const bytes = new Uint8Array(data);
    
    let offset = 0;
    const invite: Partial<Invite> = {
      relays: [],
      pubkeys: [],
      nsites: [],
      napp_pubkeys: [],
      follow_packs: []
    };

    while (offset < bytes.length) {
      const type = bytes[offset];
      offset += 1;

      switch (type) {
        case 0: {
          // Invitor pubkey
          const length = bytes[offset];
          offset += 1;
          invite.invitor_pubkey = bytesToHex(bytes.slice(offset, offset + length));
          offset += length;
          break;
        }
        case 1: {
          // Relay
          const [length, bytesRead] = decodeVarInt(bytes, offset);
          offset += bytesRead;
          const relay = new TextDecoder().decode(bytes.slice(offset, offset + length));
          offset += length;
          invite.relays!.push(relay);
          break;
        }
        case 2: {
          // Pubkey
          const length = bytes[offset];
          offset += 1;
          const pubkey = bytesToHex(bytes.slice(offset, offset + length));
          offset += length;
          invite.pubkeys!.push(pubkey);
          break;
        }
        case 3: {
          // Nsite
          const [length, bytesRead] = decodeVarInt(bytes, offset);
          offset += bytesRead;
          const nsite = new TextDecoder().decode(bytes.slice(offset, offset + length));
          offset += length;
          invite.nsites!.push(nsite);
          break;
        }
        case 4: {
          // Napp pubkey
          const length = bytes[offset];
          offset += 1;
          const appPubkey = bytesToHex(bytes.slice(offset, offset + length));
          offset += length;
          invite.napp_pubkeys!.push(appPubkey);
          break;
        }
        case 5: {
          // Follow pack
          const [length, bytesRead] = decodeVarInt(bytes, offset);
          offset += bytesRead;
          const followPack = new TextDecoder().decode(bytes.slice(offset, offset + length));
          offset += length;
          invite.follow_packs!.push(followPack);
          break;
        }
        case 6: {
          // Invitee name
          const [length, bytesRead] = decodeVarInt(bytes, offset);
          offset += bytesRead;
          invite.invitee_name = new TextDecoder().decode(bytes.slice(offset, offset + length));
          offset += length;
          break;
        }
        default:
          throw new Error(`Unknown type: ${type}`);
      }
    }

    // Validate required fields
    if (!invite.invitor_pubkey) {
      throw new Error('Missing required invitor_pubkey field');
    }
    if (!invite.relays || invite.relays.length === 0) {
      throw new Error('At least one relay is required');
    }

    return invite as Invite;
  } catch (error: unknown) {
    throw new Error(`Failed to decode nvite: ${error}`);
  }
}

export const nvite = {
  encode: encodeNvite,
  decode: decodeNvite
};