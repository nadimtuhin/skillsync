import { ClaudeAdapter } from './claude.js';
import { CursorAdapter } from './cursor.js';
import type { Adapter } from './base.js';

export const ALL_ADAPTERS: Adapter[] = [
  new ClaudeAdapter(),
  new CursorAdapter(),
];

export function getAdapter(id: string): Adapter | undefined {
  return ALL_ADAPTERS.find(a => a.id === id);
}
