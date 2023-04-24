require("isomorphic-fetch");
const { execSync } = require("child_process");
const { program } = require("commander");

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
    console.log(answer.text);
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

function getReview(options: Options) {
  const source = options.source || getCurrentBranch();
  const target = options.target || "main";

  const result = execSync(`git diff ${target}...${source}`, {
    encoding: "utf-8",
  });
  const lang = options.lang || LANG;

  const propmt = `
Here is a git diff, please do a code review in the ${lang} language.
${result}
  `;
  if (options.showPrompt) {
    console.log(propmt);
  }
  getAnswer(propmt);
}

type Options = {
  lang: string;
  source: string;
  target: string;
  showPrompt: boolean;
};

program
  .version("0.0.1")
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
    getReview(options);
  })
  .parse(process.argv);
