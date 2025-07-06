# encoded-entities

Unofficial NIP-19 encoded entities for Nostr. This library provides encoding and decoding functions for various Nostr entity types using bech32 encoding.

## Installation

```bash
npm install encoded-entities
```

## Supported Entity Types

- **nbunksec** - NIP-46 bunker connection info (pubkey, local_key, relays, secret)
- **nsite** - Nostr site/path reference with optional NIP number
- **nfilter** - Single Nostr filter
- **nfilters** - Multiple Nostr filters
- **nfeed** - Combination of filters and relays

## Usage

### Import Options

```typescript
// Import everything
import * as encodedEntities from 'encoded-entities';

// Import specific encoders/decoders
import { encodeNbunksec, decodeNbunksec } from 'encoded-entities';

// Import entity objects
import { nbunksec, nsite, nfilter, nfilters, nfeed } from 'encoded-entities';

// Import types
import { BunkerInfo, Site, NostrFilter, Feed } from 'encoded-entities';
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

### nsite - Site Reference

```typescript
import { nsite, encodeNsite, decodeNsite } from 'encoded-entities';

const site = {
  protocol: 'nostr',
  path: 'event/1234567890abcdef'
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

## Type Definitions

```typescript
interface BunkerInfo {
  pubkey: string;      // hex string
  local_key: string;   // hex string
  relays: string[];
  secret?: string;
}

interface Site {
  protocol: string;
  path: string;
}

interface NostrFilter {
  ids?: string[];
  authors?: string[];
  kinds?: number[];
  '#e'?: string[];
  '#p'?: string[];
  '#a'?: string[];
  since?: number;
  until?: number;
  limit?: number;
  search?: string;
  [key: string]: string[] | number[] | number | string | undefined;
}

interface Feed {
  filters: NostrFilter[];
  relays: string[];
}
```

## License

MIT
