# Code Review Assistant
Code Review Assistant is a command-line tool that leverages OpenAI's GPT-3.5 to provide code reviews for Git branch differences. Get insightful code reviews in your preferred language, directly from the command line!

## Requirements

An OpenAI API key


## Usage
Set your OpenAI API key as an environment variable:

``` sh
export OPENAI_API_KEY=yourapikey
```
Run Code Review Assistant with the following command:

sh
```
npx gptreview [options]
```

## Command Line Options
``` sh
-l, --lang <language>: Specify the language for the code review (default: "english").

-s, --source <sourceBranch>: Specify the source branch for the code review (default: current branch).

-t, --target <targetBranch>: Specify the target branch for the code review (default: "main").

-p, --show-prompt: Show the prompt sent to ChatGPT (default: false).
```

```sh
npx gptreview -l japanese -s feature-branch -t main
```
This will provide a code review in Japanese, comparing the feature-branch to the main branch.

## License
MIT License

## Disclaimer
This tool is not a substitute for professional code reviews conducted by experienced developers. The quality of the review depends on the performance of the GPT-3.5 model, which may not always provide accurate or optimal recommendations. Use this tool at your own risk and always double-check the suggestions provided.