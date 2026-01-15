import { encodeNinvite, decodeNinvite, ninvite } from './ninvite';
import { Invite } from '../types';

describe('ninvite', () => {
  const testInvite: Invite = {
    relays: ['wss://relay1.example.com', 'wss://relay2.example.com'],
    to_follow: ['a'.repeat(64), 'b'.repeat(64)],
    nsite_pubkeys: ['c'.repeat(64), 'd'.repeat(64)],
    invitor_pubkey: 'e'.repeat(64),
    invitee_name: 'your boy frank'
  };

  it('should encode and decode invite correctly', () => {
    const encoded = encodeNinvite(testInvite);
    expect(encoded).toMatch(/^nvite1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]+$/);
    
    const decoded = decodeNinvite(encoded);
    expect(decoded).toEqual(testInvite);
  });

  it('should encode without optional fields', () => {
    const minimalInvite: Invite = {
      relays: ['wss://relay.example.com'],
      to_follow: [],
      nsite_pubkeys: [],
      invitor_pubkey: 'f'.repeat(64)
    };
    
    const encoded = encodeNinvite(minimalInvite);
    const decoded = decodeNinvite(encoded);
    expect(decoded).toEqual(minimalInvite);
  });

  it('should work with object interface', () => {
    const encoded = ninvite.encode(testInvite);
    const decoded = ninvite.decode(encoded);
    expect(decoded).toEqual(testInvite);
  });

  it('should throw on missing required fields', () => {
    expect(() => encodeNinvite({ ...testInvite, relays: [] })).toThrow('At least one relay is required');
    expect(() => encodeNinvite({ ...testInvite, invitor_pubkey: '' } as any)).toThrow('Invitor pubkey is required');
  });

  it('should throw on invalid prefix when decoding', () => {
    expect(() => decodeNinvite('npub1invalid')).toThrow();
  });
});