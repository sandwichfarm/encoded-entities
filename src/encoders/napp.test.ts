import { encodeNapp, decodeNapp, napp } from './napp';
import { App } from '../types';

describe('napp', () => {
  const testApp: App = {
    type: 'web',
    platforms: ['ios', 'android', 'macos'],
    pubkey: 'a'.repeat(64),
    relays: ['wss://relay1.example.com', 'wss://relay2.example.com'],
    servers: ['https://app.example.com', 'https://api.example.com']
  };

  it('should encode and decode app correctly', () => {
    const encoded = encodeNapp(testApp);
    expect(encoded).toMatch(/^napp1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]+$/);
    
    const decoded = decodeNapp(encoded);
    expect(decoded).toEqual(testApp);
  });

  it('should encode native app type', () => {
    const nativeApp: App = {
      ...testApp,
      type: 'native'
    };
    
    const encoded = encodeNapp(nativeApp);
    const decoded = decodeNapp(encoded);
    expect(decoded).toEqual(nativeApp);
  });

  it('should handle different platforms', () => {
    const multiPlatformApp: App = {
      ...testApp,
      platforms: ['windows', 'linux', 'web']
    };
    
    const encoded = encodeNapp(multiPlatformApp);
    const decoded = decodeNapp(encoded);
    expect(decoded).toEqual(multiPlatformApp);
  });

  it('should work with object interface', () => {
    const encoded = napp.encode(testApp);
    const decoded = napp.decode(encoded);
    expect(decoded).toEqual(testApp);
  });

  it('should throw on missing required fields', () => {
    expect(() => encodeNapp({ ...testApp, relays: [] })).toThrow('At least one relay is required');
    expect(() => encodeNapp({ ...testApp, servers: [] })).toThrow('At least one server is required');
    expect(() => encodeNapp({ ...testApp, pubkey: '' } as any)).toThrow('Pubkey is required');
    expect(() => encodeNapp({ ...testApp, type: '' } as any)).toThrow('App type is required');
    expect(() => encodeNapp({ ...testApp, platforms: [] })).toThrow('At least one platform is required');
  });

  it('should throw on invalid prefix when decoding', () => {
    expect(() => decodeNapp('npub1invalid')).toThrow();
  });
});