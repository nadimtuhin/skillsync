import type { Command } from "commander";
import { ALL_ADAPTERS } from "../adapters/index.js";
import { print, printJson, setJsonMode } from "../ui/output.js";
import { printTable } from "../ui/table.js";

export function registerTarget(program: Command): void {
  const target = program.command("target").description("Manage sync targets");

  target
    .command("list")
    .description("Show all supported agent tools and their resolved paths")
    .option("--json", "Machine-readable output")
    .action(async (opts) => {
      if (opts.json) setJsonMode(true);

      const rows: {
        id: string;
        name: string;
        detected: string;
        paths: string;
        symlinks: string;
      }[] = [];

      for (const adapter of ALL_ADAPTERS) {
        const detected = await adapter.detect();
        rows.push({
          id: adapter.id,
          name: adapter.name,
          detected: detected ? "yes" : "no",
          paths: adapter.getPaths().join(", "),
          symlinks: adapter.supportsLink() ? "yes" : "no",
        });
      }

      if (opts.json) {
        printJson(rows);
        return;
      }

      printTable(
        [
          { header: "ID", key: "id", width: 10 },
          { header: "Tool", key: "name", width: 16 },
          { header: "Detected", key: "detected", width: 8 },
          { header: "Symlinks", key: "symlinks", width: 8 },
          { header: "Paths", key: "paths" },
        ],
        rows,
      );
    });
}
