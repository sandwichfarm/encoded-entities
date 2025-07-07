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

    // Encode to_follow pubkeys (type 2)
    if (invite.to_follow) {
      for (const pubkey of invite.to_follow) {
        const pubkeyBytes = hexToBytes(pubkey);
        encodedData.push(new Uint8Array([2, pubkeyBytes.length]));
        encodedData.push(pubkeyBytes);
      }
    }

    // Encode nsite_pubkeys (type 3)
    if (invite.nsite_pubkeys) {
      for (const nsitePubkey of invite.nsite_pubkeys) {
        const nsitePubkeyBytes = hexToBytes(nsitePubkey);
        encodedData.push(new Uint8Array([3, nsitePubkeyBytes.length]));
        encodedData.push(nsitePubkeyBytes);
      }
    }

    // Encode invitee_name if present (type 4)
    if (invite.invitee_name) {
      const nameBytes = new TextEncoder().encode(invite.invitee_name);
      encodedData.push(new Uint8Array([4]));
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
      to_follow: [],
      nsite_pubkeys: []
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
          // To follow pubkey
          const length = bytes[offset];
          offset += 1;
          const pubkey = bytesToHex(bytes.slice(offset, offset + length));
          offset += length;
          invite.to_follow!.push(pubkey);
          break;
        }
        case 3: {
          // Nsite pubkey
          const length = bytes[offset];
          offset += 1;
          const nsitePubkey = bytesToHex(bytes.slice(offset, offset + length));
          offset += length;
          invite.nsite_pubkeys!.push(nsitePubkey);
          break;
        }
        case 4: {
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