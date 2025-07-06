export interface BunkerInfo {
  pubkey: string;
  local_key: string;
  relays: string[];
  secret?: string;
}

export interface Site {
  protocol: string;
  path: string;
  nip?: number;
}

export interface NostrFilter {
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

export interface Feed {
  filters: NostrFilter[];
  relays: string[];
}