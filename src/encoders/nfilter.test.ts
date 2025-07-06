import { encodeNfilter, decodeNfilter, nfilter } from './nfilter';
import { NostrFilter } from '../types';

describe('nfilter', () => {
  const testFilter: NostrFilter = {
    ids: ['a'.repeat(64), 'b'.repeat(64)],
    authors: ['c'.repeat(64)],
    kinds: [1, 30023],
    '#e': ['d'.repeat(64)],
    '#p': ['e'.repeat(64)],
    '#a': ['30023:author:slug'],
    since: 1234567890,
    until: 1234567899,
    limit: 100,
    search: 'test search'
  };

  it('should encode and decode filter correctly', () => {
    const encoded = encodeNfilter(testFilter);
    expect(encoded).toMatch(/^nfilter1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]+$/);
    
    const decoded = decodeNfilter(encoded);
    expect(decoded).toEqual(testFilter);
  });

  it('should encode empty filter', () => {
    const emptyFilter: NostrFilter = {};
    const encoded = encodeNfilter(emptyFilter);
    const decoded = decodeNfilter(encoded);
    expect(decoded).toEqual(emptyFilter);
  });

  it('should encode partial filter', () => {
    const partialFilter: NostrFilter = {
      kinds: [1],
      authors: ['f'.repeat(64)],
      limit: 50
    };
    
    const encoded = encodeNfilter(partialFilter);
    const decoded = decodeNfilter(encoded);
    expect(decoded).toEqual(partialFilter);
  });

  it('should work with object interface', () => {
    const encoded = nfilter.encode(testFilter);
    const decoded = nfilter.decode(encoded);
    expect(decoded).toEqual(testFilter);
  });

  it('should throw on invalid prefix when decoding', () => {
    expect(() => decodeNfilter('npub1invalid')).toThrow();
  });
});