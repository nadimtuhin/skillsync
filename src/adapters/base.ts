export interface Adapter {
  id: string;
  name: string;
  detect(): Promise<boolean>;
  getPaths(): string[];
  supportsLink(): boolean;
}
