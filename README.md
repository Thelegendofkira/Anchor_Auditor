# 🛡️ Solana Anchor Auditor

**Live Demo:** https://anchor-auditor.vercel.app/

An AI-powered static analysis tool that instantly detects Solana-specific vulnerabilities in Rust smart contracts. Built to streamline the auditing process for Web3 developers, this tool dynamically fetches raw `.rs` files directly from GitHub repositories and processes them through LLMs tuned strictly for the Anchor framework's security standards.

## ✨ Features

* **Recursive Repository Scanning:** Paste a full GitHub repository URL. The backend automatically hits the GitHub Trees API to traverse the directory, filtering and concatenating only relevant `.rs` files from `programs/` and `src/` folders.
* **Domain-Specific AI Auditing:** The system prompt is heavily engineered to look for Solana-specific attack vectors, including missing signer checks, account aliasing, missing ownership constraints, and unchecked accounts.
* **Bring Your Own Key (BYOK):** Flexible AI routing architecture. Users can use the default free-tier model or plug in their own API keys for:
    * Google Gemini 2.5 Flash-Lite (Default)
    * Anthropic Claude 3.5 Sonnet
    * Groq (Llama 3 70B)
* **Developer-First UI:** A fast, functional, and bloat-free interface that returns clean, syntax-highlighted Markdown reports.

## 🛠️ Tech Stack

* **Framework:** Next.js 14 (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **APIs:** GitHub REST API, Google Generative AI SDK, Anthropic API, Groq API
* **Markdown:** `react-markdown`

## 🚀 Getting Started (Local Development)

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/Thelegendofkira/anchor-auditor.git
cd anchor-auditor
\`\`\`

### 2. Install dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Set up environment variables
Create a `.env.local` file in the root directory and add your default Gemini API key:
\`\`\`env
GEMINI_API_KEY=your_google_gemini_api_key_here
\`\`\`

### 4. Run the development server
\`\`\`bash
npm run dev
\`\`\`
Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🧪 How to Test

You can test the auditor using official Anchor framework test repositories. 

1. Open the application.
2. Ensure the provider is set to "Default - Gemini Flash-Lite (Free)".
3. Paste the following URL into the input field:
   `https://github.com/coral-xyz/anchor`
4. Click **Run Security Audit**. The system will fetch the relevant Rust files and generate a comprehensive security report detailing vulnerabilities like account aliasing (e.g., the `dup` constraint in the realloc tests) and unchecked accounts.

## 🎯 Purpose

This project was built as a Proof of Work submission for the **Solana India Fellowship**. It demonstrates full-stack architecture, secure API orchestration, and a deep understanding of Solana/Anchor developer tooling needs.
