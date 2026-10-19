import { cp, mkdir, rm } from "node:fs/promises";

const root = process.cwd();
const output = `${root}/dist`;

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const file of ["index.html", "styles.css", "script.js"]) {
  await cp(`${root}/${file}`, `${output}/${file}`);
}

await cp(`${root}/assets`, `${output}/assets`, { recursive: true });

