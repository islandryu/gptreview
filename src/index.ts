#!/usr/bin/env node
require("isomorphic-fetch");
const { execSync } = require("child_process");
const { program } = require("commander");
const chalk = require("chalk");

const API_KEY = process.env.OPENAI_API_KEY;
const LANG = "english";

const importDynamic = new Function("modulePath", "return import(modulePath)");
async function getAnswer(prompt: string) {
  const { ChatGPTAPI } = await importDynamic("chatgpt");
  try {
    const chatgpt = new ChatGPTAPI({
      apiKey: API_KEY,
      completionParams: {
        model: "gpt-3.5-turbo-0301",
        temperature: 1,
      },
    });
    const answer = await chatgpt.sendMessage(prompt);
    return answer.text
  } catch (error) {
    console.error("Error fetching answer:", error);
  }
}

function getMainBranch() {
  const mainBranch = execSync(
    'git symbolic-ref refs/remotes/origin/HEAD | sed "s@^refs/remotes/origin/@@g"',
    {
      encoding: "utf-8",
    }
  ).trim();
  return mainBranch;
}

function getCurrentBranch() {
  const currentBranch = execSync("git branch --show-current", {
    encoding: "utf-8",
  }).trim();
  return currentBranch;
}

async function getReview(options: Options, file: string) {
  const source = options.source || getCurrentBranch();
  const target = options.target || "main";

  const result = execSync(`git diff ${target}...${source} -- "${file}"`, {
    encoding: "utf-8",
  });
  const lang = options.lang || LANG;

  const prompt = `
Here is a git diff of file ${file}, please do a code review in the ${lang} language.
List the problems in the ${lang} language.
"""
${result}
"""
  `;
  const answer = await getAnswer(prompt);
  console.log(chalk.green(`\n${file}`));
  if (options.showPrompt) {
    console.log(prompt);
  }
  console.log(answer);
}

// (snip)

function runReviews(options: Options) {
  const source = options.source || getCurrentBranch();
  const target = options.target || "main";

  const files:string[] = execSync(`git diff --name-only ${target}...${source}`, {
    encoding: "utf-8",
  })
    .trim()
    .split("\n");

  files.forEach((file) => {
    getReview(options, file);
  });
}

type Options = {
  lang: string;
  source: string;
  target: string;
  showPrompt: boolean;
};

program
  .version("0.0.3")
  .description("Get review")
  .option("-l, --lang <language>", "Specify the language for the code review")
  .option(
    "-s, --source <sourceBranch>",
    "Specify the source branch for the code review"
  )
  .option(
    "-t, --target <targetBranch>",
    "Specify the target branch for the code review"
  )
  .option("-p, --show-prompt", "Show the prompt sent to ChatGPT", false)
  .action((options: Options) => {
    runReviews(options);
  })
  .parse(process.argv);
