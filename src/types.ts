// Import Filter type from nostr-tools
import type { Filter } from 'nostr-tools/lib/types/filter';

export interface BunkerInfo {
  pubkey: string;
  local_key: string;
  relays: string[];
  secret?: string;
}

export interface Site {
  relays: string[];      // At least one required
  servers: string[];     // At least one required
  pubkey: string;        // Hex string
  paths?: string[];      // Optional paths
  hashes?: string[];     // Optional hashes
  // Additional post-resolution data can be added as needed
  [key: string]: any;    // Allow for extension
}

// Re-export Filter from nostr-tools for convenience
export type NostrFilter = Filter;

export interface Feed {
  filters: Filter[];
  relays: string[];
}