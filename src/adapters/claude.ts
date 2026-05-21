import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { Adapter } from "./base.js";

export class ClaudeAdapter implements Adapter {
  id = "claude";
  name = "Claude Code";

  async detect(): Promise<boolean> {
    return existsSync(join(homedir(), ".claude"));
  }

  getPaths(): string[] {
    return [join(homedir(), ".claude", "skills")];
  }

  supportsLink(): boolean {
    return process.platform !== "win32";
  }
}
