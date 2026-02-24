import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT =
    "You are a Solana security auditor. I am providing multiple .rs files from a repository. Identify which file you are auditing, state the vulnerabilities found in that specific file, and move to the next. Format with clear Markdown.";

function parseGithubUrl(githubUrl: string): { owner: string; repo: string } | null {
    try {
        const url = new URL(githubUrl);
        const parts = url.pathname.replace(/^\//, "").split("/");
        if (parts.length < 2) return null;
        return { owner: parts[0], repo: parts[1] };
    } catch {
        return null;
    }
}

async function fetchTree(owner: string, repo: string): Promise<{ path: string }[]> {
    for (const branch of ["main", "master"]) {
        const res = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
            { headers: { Accept: "application/vnd.github+json" } }
        );
        if (res.ok) {
            const data = await res.json();
            return data.tree ?? [];
        }
    }
    return [];
}

async function buildCombinedCode(owner: string, repo: string): Promise<string | null> {
    const tree = await fetchTree(owner, repo);
    if (!tree.length) return null;

    const filtered = tree
        .filter(
            (f) =>
                f.path.endsWith(".rs") &&
                (f.path.includes("programs/") || f.path.includes("src/"))
        )
        .slice(0, 15);

    if (!filtered.length) return null;

    const fileContents = await Promise.all(
        filtered.map(async (f) => {
            const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${f.path}`;
            const res = await fetch(rawUrl);
            if (!res.ok) return null;
            const code = await res.text();
            return `--- FILE: ${f.path} ---\n${code}`;
        })
    );

    return fileContents.filter(Boolean).join("\n\n");
}

async function runGemini(apiKey: string, model: string, code: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.generateContent({
        model,
        contents: code,
        config: { systemInstruction: SYSTEM_PROMPT },
    });
    return result.text ?? "";
}

async function runClaude(apiKey: string, code: string): Promise<string> {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 4096,
            system: SYSTEM_PROMPT,
            messages: [{ role: "user", content: code }],
        }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message ?? "Claude API error");
    return data.content?.[0]?.text ?? "";
}

async function runGroq(apiKey: string, code: string): Promise<string> {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "llama3-70b-8192",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: code },
            ],
        }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message ?? "Groq API error");
    return data.choices?.[0]?.message?.content ?? "";
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { githubUrl, provider = "default", customApiKey } = body as {
        githubUrl: string;
        provider: string;
        customApiKey?: string;
    };

    if (!githubUrl) {
        return NextResponse.json({ error: "githubUrl is required" }, { status: 400 });
    }

    const parsed = parseGithubUrl(githubUrl);
    if (!parsed) {
        return NextResponse.json({ error: "Could not parse owner/repo from URL." }, { status: 400 });
    }

    const { owner, repo } = parsed;
    const combined = await buildCombinedCode(owner, repo);

    if (!combined) {
        return NextResponse.json(
            { error: "No Anchor .rs files found in programs/ or src/, or repo tree could not be fetched." },
            { status: 400 }
        );
    }

    try {
        let report: string;

        switch (provider) {
            case "gemini-custom":
                if (!customApiKey) throw new Error("Custom API key required for this provider.");
                report = await runGemini(customApiKey, "gemini-2.5-flash-lite", combined);
                break;
            case "claude":
                if (!customApiKey) throw new Error("Custom API key required for this provider.");
                report = await runClaude(customApiKey, combined);
                break;
            case "groq":
                if (!customApiKey) throw new Error("Custom API key required for this provider.");
                report = await runGroq(customApiKey, combined);
                break;
            default:
                report = await runGemini(process.env.GEMINI_API_KEY!, "gemini-2.5-flash-lite", combined);
        }

        return NextResponse.json({ report });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error from AI provider.";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
