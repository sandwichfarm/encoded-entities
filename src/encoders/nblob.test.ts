import { encodeNblob, decodeNblob, nblob } from './nblob';
import { Blob } from '../types';

describe('nblob', () => {
  const testBlob: Blob = {
    hash: 'a'.repeat(64),
    servers: ['https://blob1.example.com', 'https://blob2.example.com'],
    pubkey: 'b'.repeat(64),
    path: '/uploads/file.pdf'
  };

  it('should encode and decode blob correctly', () => {
    const encoded = encodeNblob(testBlob);
    expect(encoded).toMatch(/^nblob1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]+$/);
    
    const decoded = decodeNblob(encoded);
    expect(decoded).toEqual(testBlob);
  });

  it('should encode without optional path', () => {
    const blobWithoutPath: Blob = {
      hash: 'c'.repeat(64),
      servers: ['https://blob.example.com'],
      pubkey: 'd'.repeat(64)
    };
    
    const encoded = encodeNblob(blobWithoutPath);
    const decoded = decodeNblob(encoded);
    expect(decoded).toEqual(blobWithoutPath);
  });

  it('should handle multiple servers', () => {
    const multiServerBlob: Blob = {
      hash: 'e'.repeat(64),
      servers: ['https://s1.com', 'https://s2.com', 'https://s3.com', 'https://s4.com'],
      pubkey: 'f'.repeat(64)
    };
    
    const encoded = encodeNblob(multiServerBlob);
    const decoded = decodeNblob(encoded);
    expect(decoded).toEqual(multiServerBlob);
  });

  it('should work with object interface', () => {
    const encoded = nblob.encode(testBlob);
    const decoded = nblob.decode(encoded);
    expect(decoded).toEqual(testBlob);
  });

  it('should throw on missing required fields', () => {
    expect(() => encodeNblob({ ...testBlob, hash: '' } as any)).toThrow('Hash is required');
    expect(() => encodeNblob({ ...testBlob, servers: [] })).toThrow('At least one server is required');
    expect(() => encodeNblob({ ...testBlob, pubkey: '' } as any)).toThrow('Pubkey is required');
  });

  it('should throw on invalid prefix when decoding', () => {
    expect(() => decodeNblob('npub1invalid')).toThrow();
  });
});