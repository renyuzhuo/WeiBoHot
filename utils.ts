import type { Word } from "./types.ts";

/** 合并两次热门话题并根据 id 去重 */
export function mergeWords(
  words: Word[],
  another: Word[],
): Word[] {
  const temp = [...words, ...another];
  return temp.reduce((acc: Word[], current: Word) => {
    const x = acc.find((item) => item.title === current.title);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);
}

export async function createReadme(words: Word[]): Promise<string> {
  const readme = await Deno.readTextFile("./README.md");
  return readme.replace(/<!-- BEGIN -->[\W\w]*<!-- END -->/, createList(words));
}

export function createList(words: Word[]): string {
  return `<!-- BEGIN -->
<!-- 最后更新时间 ${Date()} -->
${
    words.map((x) => `1. [${x.title}](https://s.weibo.com/${x.url})`)
      .join("\n")
  }
<!-- END -->`;
}

export function createArchive(words: Word[], date: string): string {
  return `# ${date}\n
共 ${words.length} 条\n
${createList(words)}
`;
}

function formatDate(date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) {
    month = "0" + month;
  }
  if (day.length < 2) {
    day = "0" + day;
  }

  return [year, month, day].join("-");
}

export function createArchiveIndex(): string {
  let dateStr = "";
  let currentDate = new Date();

  while (currentDate >= new Date("2024-10-14")) {
    let formattedDate = formatDate(currentDate);
    dateStr += `1. [${formattedDate}](./${formattedDate})\n`;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return `<!-- BEGIN -->
  ${dateStr}
<!-- END -->`;
}

export async function updateArchiveIndex(): Promise<string> {
  const readme = await Deno.readTextFile("./archives/index.md");
  return readme.replace(
    /<!-- BEGIN -->[\W\w]*<!-- END -->/,
    createArchiveIndex(),
  );
}
