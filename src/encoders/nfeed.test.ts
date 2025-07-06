import { encodeNfeed, decodeNfeed, nfeed } from './nfeed';
import { Feed } from '../types';

describe('nfeed', () => {
  const testFeed: Feed = {
    filters: [
      {
        kinds: [1],
        authors: ['a'.repeat(64)],
        limit: 10
      },
      {
        kinds: [30023],
        '#d': ['test-slug'],
        since: 1234567890
      }
    ],
    relays: ['wss://relay1.example.com', 'wss://relay2.example.com']
  };

  it('should encode and decode feed correctly', () => {
    const encoded = encodeNfeed(testFeed);
    expect(encoded).toMatch(/^nfeed1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]+$/);
    
    const decoded = decodeNfeed(encoded);
    expect(decoded).toEqual(testFeed);
  });

  it('should encode feed with empty filters', () => {
    const feedWithEmptyFilters: Feed = {
      filters: [],
      relays: ['wss://relay.example.com']
    };
    
    const encoded = encodeNfeed(feedWithEmptyFilters);
    const decoded = decodeNfeed(encoded);
    expect(decoded).toEqual(feedWithEmptyFilters);
  });

  it('should work with object interface', () => {
    const encoded = nfeed.encode(testFeed);
    const decoded = nfeed.decode(encoded);
    expect(decoded).toEqual(testFeed);
  });

  it('should throw on invalid prefix when decoding', () => {
    expect(() => decodeNfeed('npub1invalid')).toThrow();
  });
});