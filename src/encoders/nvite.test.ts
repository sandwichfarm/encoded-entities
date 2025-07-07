import { encodeNvite, decodeNvite, nvite } from './nvite';
import { Invite } from '../types';

describe('nvite', () => {
  const testInvite: Invite = {
    relays: ['wss://relay1.example.com', 'wss://relay2.example.com'],
    pubkeys: ['a'.repeat(64), 'b'.repeat(64)],
    nsites: ['nsite1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq', 'nsite1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'],
    napp_pubkeys: ['c'.repeat(64)],
    follow_packs: ['naddr1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq'],
    invitor_pubkey: 'd'.repeat(64),
    invitee_name: 'Alice'
  };

  it('should encode and decode invite correctly', () => {
    const encoded = encodeNvite(testInvite);
    expect(encoded).toMatch(/^nvite1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]+$/);
    
    const decoded = decodeNvite(encoded);
    expect(decoded).toEqual(testInvite);
  });

  it('should encode without optional fields', () => {
    const minimalInvite: Invite = {
      relays: ['wss://relay.example.com'],
      pubkeys: [],
      nsites: [],
      napp_pubkeys: [],
      follow_packs: [],
      invitor_pubkey: 'e'.repeat(64)
    };
    
    const encoded = encodeNvite(minimalInvite);
    const decoded = decodeNvite(encoded);
    expect(decoded).toEqual(minimalInvite);
  });

  it('should work with object interface', () => {
    const encoded = nvite.encode(testInvite);
    const decoded = nvite.decode(encoded);
    expect(decoded).toEqual(testInvite);
  });

  it('should throw on missing required fields', () => {
    expect(() => encodeNvite({ ...testInvite, relays: [] })).toThrow('At least one relay is required');
    expect(() => encodeNvite({ ...testInvite, invitor_pubkey: '' } as any)).toThrow('Invitor pubkey is required');
  });

  it('should throw on invalid prefix when decoding', () => {
    expect(() => decodeNvite('npub1invalid')).toThrow();
  });
});