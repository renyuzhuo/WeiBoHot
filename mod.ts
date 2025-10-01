#!/usr/bin/env -S deno run --unstable --allow-net --allow-read --allow-write --import-map=import_map.json
// Copyright 2020 justjavac(迷渡). All rights reserved. MIT license.
import { format } from "std/datetime/mod.ts";
import { join } from "std/path/mod.ts";
import { exists } from "std/fs/mod.ts";

import type { Word } from "./types.ts";
import {
  createArchive,
  createReadme,
  mergeWords,
  updateArchiveIndex,
} from "./utils.ts";

const regexp = /<a href="(\/weibo\?q=[^"]+)".*?>(.+)<\/a>/g;

const response = await fetch("https://s.weibo.com/top/summary", {
  headers: {
    "Cookie":
      "SUB=_2AkMWJrkXf8NxqwJRmP8SxWjnaY12zwnEieKgekjMJRMxHRl-yj9jqmtbtRB6PaaX-IGp-AjmO6k5cS-OH2X9CayaTzVD",
  },
});

if (!response.ok) {
  console.error(response.statusText);
  Deno.exit(-1);
}

const result: string = await response.text();

const matches = result.matchAll(regexp);

const words: Word[] = Array.from(matches).map((x) => ({
  url: x[1],
  title: x[2],
})).filter((word) =>
  !word.url.includes("%E4%B9%A0%E8%BF%91%E5%B9%B3") &&
  !word.url.includes("%E6%80%BB%E4%B9%A6%E8%AE%B0")
);

const yyyyMMdd = format(new Date(), "yyyy-MM-dd");
const fullPath = join("raw", `${yyyyMMdd}.json`);

let wordsAlreadyDownload: Word[] = [];
if (await exists(fullPath)) {
  const content = await Deno.readTextFile(fullPath);
  wordsAlreadyDownload = JSON.parse(content);
}

// 保存原始数据
const queswordsAll = mergeWords(words, wordsAlreadyDownload);
await Deno.writeTextFile(fullPath, JSON.stringify(queswordsAll));
await Deno.writeTextFile("./raw/index.json", JSON.stringify(queswordsAll));

// 更新 README.md
const readme = await createReadme(queswordsAll);
await Deno.writeTextFile("./README.md", readme);

// 更新 archives
const archiveText = createArchive(queswordsAll, yyyyMMdd);
const archivePath = join("archives", `${yyyyMMdd}.md`);
await Deno.writeTextFile(archivePath, archiveText);

const archiveIndexText = await updateArchiveIndex();
const archiveIndexPth = join("archives", "index.md");
await Deno.writeTextFile(archiveIndexPth, archiveIndexText);
