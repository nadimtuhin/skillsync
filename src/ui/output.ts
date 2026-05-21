let jsonMode = false;

export function setJsonMode(value: boolean): void {
  jsonMode = value;
}

export function isJsonMode(): boolean {
  return jsonMode;
}

export function printJson(data: unknown): void {
  process.stdout.write(`${JSON.stringify(data, null, 2)}\n`);
}

export function print(message: string): void {
  if (!jsonMode) process.stdout.write(`${message}\n`);
}

export function printError(message: string): void {
  process.stderr.write(`${message}\n`);
}

export function exitOk(): never {
  process.exit(0);
}

export function exitErr(message: string): never {
  printError(message);
  process.exit(1);
}
