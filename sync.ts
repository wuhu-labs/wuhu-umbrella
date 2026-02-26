#!/usr/bin/env bun
import { $ } from "bun";
import manifest from "./repos.yml";

for (const repo of manifest.repos) {
  if (await Bun.file(`${repo.path}/.git/HEAD`).exists()) {
    console.log(`Pulling ${repo.name} (${repo.path})...`);
    await $`git -C ${repo.path} pull --ff-only`;
  } else {
    console.log(`Cloning ${repo.name} → ${repo.path}...`);
    await $`git clone -b ${repo.branch} ${repo.url} ${repo.path}`;
  }
}

console.log("\nAll repos synced.");
