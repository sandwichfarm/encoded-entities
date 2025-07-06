import { encodeNsite, decodeNsite, nsite } from './nsite';
import { Site } from '../types';

describe('nsite', () => {
  const testSite: Site = {
    relays: ['wss://relay1.example.com', 'wss://relay2.example.com'],
    servers: ['https://server1.example.com', 'https://server2.example.com'],
    pubkey: 'a'.repeat(64)
  };

  it('should encode and decode site correctly', () => {
    const encoded = encodeNsite(testSite);
    expect(encoded).toMatch(/^nsite1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]+$/);
    
    const decoded = decodeNsite(encoded);
    expect(decoded).toEqual(testSite);
  });

  it('should encode with optional paths and hashes', () => {
    const siteWithPaths: Site = {
      ...testSite,
      paths: ['/api/v1', '/nostr'],
      hashes: ['b'.repeat(64), 'c'.repeat(64)]
    };
    
    const encoded = encodeNsite(siteWithPaths);
    const decoded = decodeNsite(encoded);
    expect(decoded).toEqual(siteWithPaths);
  });

  it('should encode with custom fields', () => {
    const siteWithCustom: Site = {
      ...testSite,
      customField: 'custom value',
      metadata: { version: 1, type: 'blog' }
    };
    
    const encoded = encodeNsite(siteWithCustom);
    const decoded = decodeNsite(encoded);
    expect(decoded).toEqual(siteWithCustom);
  });

  it('should work with object interface', () => {
    const encoded = nsite.encode(testSite);
    const decoded = nsite.decode(encoded);
    expect(decoded).toEqual(testSite);
  });

  it('should throw on missing required fields', () => {
    expect(() => encodeNsite({ relays: [], servers: ['test'], pubkey: 'a'.repeat(64) })).toThrow('At least one relay is required');
    expect(() => encodeNsite({ relays: ['test'], servers: [], pubkey: 'a'.repeat(64) })).toThrow('At least one server is required');
    expect(() => encodeNsite({ relays: ['test'], servers: ['test'], pubkey: '' } as any)).toThrow('Pubkey is required');
  });

  it('should throw on invalid prefix when decoding', () => {
    expect(() => decodeNsite('npub1invalid')).toThrow();
  });
});