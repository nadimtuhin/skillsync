import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { Adapter } from "./base.js";

export class CursorAdapter implements Adapter {
  id = "cursor";
  name = "Cursor";

  async detect(): Promise<boolean> {
    return existsSync(join(homedir(), ".cursor"));
  }

  getPaths(): string[] {
    return [join(homedir(), ".cursor", "rules")];
  }

  supportsLink(): boolean {
    return process.platform !== "win32";
  }
}
