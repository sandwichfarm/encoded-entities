import { encodeNbunksec, decodeNbunksec, nbunksec } from './nbunksec';
import { BunkerInfo } from '../types';

describe('nbunksec', () => {
  const testBunkerInfo: BunkerInfo = {
    pubkey: 'a'.repeat(64),
    local_key: 'b'.repeat(64),
    relays: ['wss://relay1.example.com', 'wss://relay2.example.com'],
    secret: 'test-secret'
  };

  it('should encode and decode bunker info correctly', () => {
    const encoded = encodeNbunksec(testBunkerInfo);
    expect(encoded).toMatch(/^nbunksec1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]+$/);
    
    const decoded = decodeNbunksec(encoded);
    expect(decoded).toEqual(testBunkerInfo);
  });

  it('should encode without secret', () => {
    const infoWithoutSecret: BunkerInfo = {
      ...testBunkerInfo,
      secret: undefined
    };
    delete infoWithoutSecret.secret;
    
    const encoded = encodeNbunksec(infoWithoutSecret);
    const decoded = decodeNbunksec(encoded);
    expect(decoded).toEqual(infoWithoutSecret);
  });

  it('should work with object interface', () => {
    const encoded = nbunksec.encode(testBunkerInfo);
    const decoded = nbunksec.decode(encoded);
    expect(decoded).toEqual(testBunkerInfo);
  });

  it('should throw on invalid hex pubkey', () => {
    const invalidInfo: BunkerInfo = {
      ...testBunkerInfo,
      pubkey: 'invalid-hex'
    };
    expect(() => encodeNbunksec(invalidInfo)).toThrow();
  });

  it('should throw on invalid prefix when decoding', () => {
    expect(() => decodeNbunksec('npub1invalid')).toThrow();
  });
});