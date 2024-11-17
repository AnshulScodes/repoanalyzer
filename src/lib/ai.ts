import OpenAI from 'openai';

export async function analyzeRepo(apiKey: string, files: Array<{ path: string; content: string }>) {
  const openai = new OpenAI({ apiKey });
  
  const summary = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are a code analysis expert. Analyze the GitHub repository content and provide a high-level overview, including: \
      1. Project purpose and technologies used, \
      2. Main file structure and notable files, \
      3. Code quality and documentation status, \
      4. Recent development activity and key updates, \
      5. Community engagement (issues, pull requests, contributions), \
      6. Areas needing improvement (open issues, outdated dependencies). \
      Keep it concise yet detailed enough to give a comprehensive understanding."
      },
      {
        role: "user",
        content: `Analyze this repository:\n\n${files.map(f => `${f.path}:\n${f.content}\n---`).join('\n')}`
      }
    ]
  });
  
  return summary.choices[0].message.content;
}

export async function askQuestion(
  apiKey: string, 
  files: Array<{ path: string; content: string }>, 
  question: string
) {
  const openai = new OpenAI({ apiKey });
  
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are a code expert. Answer questions about the repository content accurately and concisely."
      },
      {
        role: "user",
        content: `Repository content:\n\n${files.map(f => `${f.path}:\n${f.content}\n---`).join('\n')}\n\nQuestion: ${question}`
      }
    ]
  });
  
  return response.choices[0].message.content;
}