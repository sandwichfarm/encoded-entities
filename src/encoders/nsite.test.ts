import { encodeNsite, decodeNsite, nsite } from './nsite';
import { Site } from '../types';

describe('nsite', () => {
  const testSite: Site = {
    protocol: 'nostr',
    path: 'event/1234567890abcdef',
    nip: 19
  };

  it('should encode and decode site correctly', () => {
    const encoded = encodeNsite(testSite);
    expect(encoded).toMatch(/^nsite1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]+$/);
    
    const decoded = decodeNsite(encoded);
    expect(decoded).toEqual(testSite);
  });

  it('should encode without nip', () => {
    const siteWithoutNip: Site = {
      protocol: 'nostr',
      path: 'profile/pubkey123'
    };
    
    const encoded = encodeNsite(siteWithoutNip);
    const decoded = decodeNsite(encoded);
    expect(decoded).toEqual(siteWithoutNip);
  });

  it('should work with object interface', () => {
    const encoded = nsite.encode(testSite);
    const decoded = nsite.decode(encoded);
    expect(decoded).toEqual(testSite);
  });

  it('should throw on invalid prefix when decoding', () => {
    expect(() => decodeNsite('npub1invalid')).toThrow();
  });
});