# encoded-entities

Unofficial NIP-19 encoded entities. This library provides encoding and decoding functions for various Nostr entity types using bech32 encoding.

## Installation

```bash
npm install encoded-entities nostr-tools
```

Note: `nostr-tools` is a peer dependency and must be installed separately.

## Supported Entity Types

- **nbunksec** - NIP-46 bunker connection info (pubkey, local_key, relays, secret)
- **nsite** - Nostr site resolution info (relays, servers, pubkey)
- **nfilter** - Single Nostr filter
- **nfilters** - Multiple Nostr filters
- **nfeed** - Combination of filters and relays
- **nvite** - Nostr invite for new users (relays, pubkeys, nsites, apps, follow packs)
- **napp** - Nostr app info (type, platforms, pubkey, relays, servers)
- **nblob** - Blob/file reference (hash, servers, pubkey, optional path)

## Usage

### Import Options

```typescript
// Import everything
import * as encodedEntities from 'encoded-entities';

// Import specific encoders/decoders
import { encodeNbunksec, decodeNbunksec } from 'encoded-entities';

// Import entity objects
import { nbunksec, nsite, nfilter, nfilters, nfeed, nvite, napp, nblob } from 'encoded-entities';

// Import types
import { BunkerInfo, Site, Feed, Invite, App, Blob } from 'encoded-entities';
// NostrFilter is imported from nostr-tools (peer dependency)
```

### nbunksec - Bunker Connection Info

```typescript
import { nbunksec, encodeNbunksec, decodeNbunksec } from 'encoded-entities';

const bunkerInfo = {
  pubkey: 'a'.repeat(64),
  local_key: 'b'.repeat(64),
  relays: ['wss://relay1.example.com', 'wss://relay2.example.com'],
  secret: 'optional-secret'
};

// Using function interface
const encoded = encodeNbunksec(bunkerInfo);
const decoded = decodeNbunksec(encoded);

// Using object interface
const encoded2 = nbunksec.encode(bunkerInfo);
const decoded2 = nbunksec.decode(encoded2);
```

### nsite - Site Resolution Info

```typescript
import { nsite, encodeNsite, decodeNsite } from 'encoded-entities';

const site = {
  relays: ['wss://relay1.example.com', 'wss://relay2.example.com'],
  servers: ['https://server1.example.com', 'https://server2.example.com'],
  pubkey: 'a'.repeat(64)  // hex string
};

const encoded = nsite.encode(site);
const decoded = nsite.decode(encoded);
```

### nfilter - Single Filter

```typescript
import { nfilter, encodeNfilter, decodeNfilter } from 'encoded-entities';

const filter = {
  ids: ['eventid1', 'eventid2'],
  authors: ['pubkey1'],
  kinds: [1, 30023],
  '#e': ['referenced-event-id'],
  '#p': ['referenced-pubkey'],
  '#d': ['identifier'],  // Custom tags supported
  since: 1234567890,
  until: 1234567899,
  limit: 100,
  search: 'search term'
};

const encoded = nfilter.encode(filter);
const decoded = nfilter.decode(encoded);
```

### nfilters - Multiple Filters

```typescript
import { nfilters, encodeNfilters, decodeNfilters } from 'encoded-entities';

const filters = [
  { kinds: [1], authors: ['pubkey1'], limit: 10 },
  { kinds: [30023], '#d': ['identifier'] }
];

const encoded = nfilters.encode(filters);
const decoded = nfilters.decode(encoded);
```

### nfeed - Filters + Relays

```typescript
import { nfeed, encodeNfeed, decodeNfeed } from 'encoded-entities';

const feed = {
  filters: [
    { kinds: [1], limit: 20 },
    { kinds: [30023], authors: ['pubkey1'] }
  ],
  relays: ['wss://relay1.example.com', 'wss://relay2.example.com']
};

const encoded = nfeed.encode(feed);
const decoded = nfeed.decode(encoded);
```

### nvite - Invite for New Users

```typescript
import { nvite, encodeNvite, decodeNvite } from 'encoded-entities';

const invite = {
  relays: ['wss://relay1.example.com', 'wss://relay2.example.com'],
  pubkeys: ['pubkey1', 'pubkey2'],  // Decoded from naddrs
  nsites: ['nsite1...', 'nsite1...'],  // Encoded nsite entities
  napp_pubkeys: ['app_pubkey1'],
  follow_packs: ['naddr1...'],  // Decoded from naddrs
  invitor_pubkey: 'invitor_pubkey_hex',
  invitee_name: 'Alice'  // optional
};

const encoded = nvite.encode(invite);
const decoded = nvite.decode(encoded);
```

### napp - App Information

```typescript
import { napp, encodeNapp, decodeNapp } from 'encoded-entities';

const app = {
  type: 'web',  // or 'native'
  platforms: ['ios', 'android', 'macos', 'windows', 'linux'],
  pubkey: 'app_pubkey_hex',
  relays: ['wss://relay1.example.com', 'wss://relay2.example.com'],
  servers: ['https://app.example.com', 'https://api.example.com']
};

const encoded = napp.encode(app);
const decoded = napp.decode(encoded);
```

### nblob - Blob/File Reference

```typescript
import { nblob, encodeNblob, decodeNblob } from 'encoded-entities';

const blob = {
  hash: 'sha256_hash_hex',  // Content hash
  servers: ['https://blob1.example.com', 'https://blob2.example.com'],
  pubkey: 'publisher_pubkey_hex',
  path: '/uploads/document.pdf'  // optional
};

const encoded = nblob.encode(blob);
const decoded = nblob.decode(encoded);
```

## Type Definitions

```typescript
interface BunkerInfo {
  pubkey: string;      // hex string
  local_key: string;   // hex string
  relays: string[];
  secret?: string;
}

interface Site {
  relays: string[];      // At least one required
  servers: string[];     // At least one required  
  pubkey: string;        // Hex string
}

// NostrFilter type is imported from nostr-tools
// See: https://github.com/nbd-wtf/nostr-tools

interface Feed {
  filters: Filter[];     // Filter type from nostr-tools
  relays: string[];
}

interface Invite {
  relays: string[];
  pubkeys: string[];     // Decoded from naddrs
  nsites: string[];      // Encoded nsite entities
  napp_pubkeys: string[];// App pubkeys
  follow_packs: string[];// Decoded from naddrs
  invitor_pubkey: string;// Hex string
  invitee_name?: string; // Optional name for invitee
}

interface App {
  type: 'web' | 'native';
  platforms: string[];   // e.g., ['ios', 'android', 'macos', 'windows', 'linux']
  pubkey: string;        // Hex string
  relays: string[];
  servers: string[];
}

interface Blob {
  path?: string;         // Optional file path or identifier
  hash: string;          // Content hash (hex string)
  servers: string[];     // Server URLs where blob is hosted
  pubkey: string;        // Publisher pubkey (hex string)
}
```

## License

MIT
