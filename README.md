🦀 Solana Anchor Auditor
A lightweight, AI-powered static analysis tool for Solana smart contracts.

Instead of manually copying and pasting dozens of Rust files into ChatGPT, this tool takes a GitHub repository URL, automatically recursively fetches all the Anchor smart contract files (.rs), and feeds them into an LLM to generate a consolidated security report.

Built as a Proof of Work MVP for the Solana India Fellowship.

✨ Features
Instant Repo Parsing: Just paste a GitHub link. The backend automatically crawls the Git tree, filters for .rs files in the programs/ or src/ directories, and grabs the raw code.

BYOK (Bring Your Own Key): Defaults to a free, high-speed Gemini 2.5 Flash-Lite endpoint. Power users can plug in their own API keys to route the audit through Anthropic (Claude 3.5 Sonnet), Groq (Llama 3), or standard Gemini models.

Anchor-Specific Context: The system prompts are tuned specifically to look for Solana/Anchor vulnerabilities like missing signer checks, account aliasing (dup constraints), and unauthorized CPIs.

Markdown Reports: Clean, formatted output that breaks down vulnerabilities file-by-file.

🏗️ Architecture Under the Hood
This is a full-stack Next.js (App Router) application.

The Frontend: A strictly functional React interface. No unnecessary animations, just form validation and state management. It sends the repo URL and provider choice to the backend.

The GitHub Fetcher (Backend): The Next.js API route hits the GitHub Git Trees API (/git/trees/main?recursive=1) to get a flat map of the repository. It filters for Rust files and uses Promise.all to concurrently fetch the raw text of up to 15 files at once.

The AI Router (Backend): All fetched files are concatenated into one massive string with --- FILE: [path] --- delimiters. A switch statement routes this payload to the correct LLM provider (Google SDK, or native fetch for Anthropic/Groq) based on the user's BYOK selection.

The Output: The LLM streams or returns a Markdown response, which is sent back to the client and rendered using react-markdown.

⚠️ Limitations & Edge Cases (Keepin' it real)
Because this is a rapid MVP, there are a few physical limitations to be aware of:

Vercel Serverless Timeouts: If you point this at a massive repository (like the entire Solana Labs monorepo), the Vercel serverless function will likely hit its 10-to-15 second timeout limit while waiting for the LLM to read 100,000 lines of code. It works best on standard-sized protocol repos.

File Caps: To prevent timeouts and API rate limits, the backend currently caps the concurrent file fetch to a maximum of 15 .rs files per request.

AI Hallucinations: This is an AI tool, not a human auditor. It might flag intended logic as a bug, or miss complex architectural exploits. Do not use this as the sole security check for production funds.

🚀 Local Setup
If you want to spin this up locally:

Clone the repo and run npm install.

Create a .env.local file in the root directory.

Add your default Gemini API key:

Code snippet
GEMINI_API_KEY=your_key_here
Run the development server:

Bash
npm run dev
