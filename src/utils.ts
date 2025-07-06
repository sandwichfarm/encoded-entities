export function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error('Hex string must have even length');
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function encodeVarInt(num: number): Uint8Array {
  const bytes: number[] = [];
  while (num > 127) {
    bytes.push((num & 0x7f) | 0x80);
    num >>= 7;
  }
  bytes.push(num & 0x7f);
  return new Uint8Array(bytes);
}

export function decodeVarInt(bytes: Uint8Array, offset: number): [number, number] {
  let result = 0;
  let shift = 0;
  let bytesRead = 0;

  while (offset + bytesRead < bytes.length) {
    const byte = bytes[offset + bytesRead];
    result |= (byte & 0x7f) << shift;
    bytesRead++;
    
    if ((byte & 0x80) === 0) {
      break;
    }
    
    shift += 7;
    if (shift > 35) {
      throw new Error('VarInt too large');
    }
  }

  return [result, bytesRead];
}