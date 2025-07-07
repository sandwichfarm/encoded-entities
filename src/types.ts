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
}

// Re-export Filter from nostr-tools for convenience
export type NostrFilter = Filter;

export interface Feed {
  filters: Filter[];
  relays: string[];
}

export interface App {
  type: 'web' | 'native';
  platforms: string[];   // e.g., ['ios', 'android', 'macos', 'windows', 'linux']
  pubkey: string;        // Hex string
  relays: string[];
  servers: string[];
}

export interface Invite {
  relays: string[];
  to_follow: string[];      // Pubkeys to follow
  nsite_pubkeys: string[];  // Pubkeys of nsite entities
  invitor_pubkey: string;   // Hex string
  invitee_name?: string;    // Optional name for invitee
}

export interface Blob {
  path?: string;         // Optional file path or identifier
  hash: string;          // Content hash (hex string)
  servers: string[];     // Server URLs where blob is hosted
  pubkey: string;        // Hex string (required)
}