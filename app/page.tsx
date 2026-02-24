"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

const PROVIDERS = [
  { value: "default", label: "Default - Gemini Flash-Lite (Free)" },
  { value: "gemini-custom", label: "Custom - Gemini Pro/Flash" },
  { value: "claude", label: "Custom - Anthropic Claude 3.5" },
  { value: "groq", label: "Custom - Groq Llama 3 (Fast)" },
];

export default function Home() {
  const [url, setUrl] = useState("");
  const [provider, setProvider] = useState("default");
  const [customApiKey, setCustomApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);

  const isCustom = provider !== "default";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setReport(null);

    if (!url.includes("github.com")) {
      setError("Please enter a valid GitHub repository URL.");
      return;
    }

    if (isCustom && !customApiKey.trim()) {
      setError("Please enter your API key for the selected provider.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubUrl: url, provider, customApiKey }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
      } else {
        setReport(data.report);
      }
    } catch {
      setError("Failed to reach the server. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Solana Anchor Auditor
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Paste a GitHub repo URL to audit all Anchor smart contracts inside it.
        </p>

        <div className="border border-yellow-300 bg-yellow-50 rounded p-4 mb-6 text-sm text-gray-700">
          <p className="font-semibold mb-2">Testing Instructions</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Find a public GitHub repo containing Solana Anchor programs.</li>
            <li>Paste the repo URL into the input below and click Audit.</li>
          </ol>
          <p className="mt-3 text-xs font-medium text-gray-600">Demo URL (large repo — may take ~10s):</p>
          <code className="block mt-1 text-xs bg-yellow-100 border border-yellow-200 rounded px-2 py-1 break-all select-all">
            https://github.com/coral-xyz/anchor
          </code>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-3 mb-4">
          <select
            id="provider-select"
            value={provider}
            onChange={(e) => { setProvider(e.target.value); setCustomApiKey(""); }}
            className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PROVIDERS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>

          {isCustom && (
            <input
              id="api-key-input"
              type="password"
              placeholder="Paste your API key..."
              value={customApiKey}
              onChange={(e) => setCustomApiKey(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}

          <div className="flex gap-2">
            <input
              id="github-url"
              type="text"
              placeholder="Paste a GitHub Repository URL..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              id="audit-button"
              type="submit"
              disabled={!url.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded"
            >
              {isLoading ? "Running..." : "Audit"}
            </button>
          </div>
        </form>

        {error && (
          <div className="border border-red-400 bg-red-50 rounded px-4 py-3 mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {isLoading && (
          <div className="border border-gray-200 bg-white rounded p-6 text-center text-sm text-gray-500">
            <div className="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2 align-middle" />
            Fetching repo tree and analyzing contracts... this may take a few seconds.
          </div>
        )}

        {report && !isLoading && (
          <div className="border border-gray-200 bg-white rounded p-6">
            <p className="text-xs font-semibold uppercase text-gray-400 mb-4 tracking-wide">
              Audit Report
            </p>
            <div className="text-sm text-gray-800 space-y-2">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-lg font-bold text-gray-900 mt-4 mb-2 border-b pb-1">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-base font-semibold text-gray-800 mt-4 mb-1">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-semibold text-gray-700 mt-3 mb-1">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-sm text-gray-700 leading-relaxed mb-2">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mb-2 ml-2">{children}</ul>
                  ),
                  li: ({ children }) => <li>{children}</li>,
                  code: ({ inline, children }: { inline?: boolean; children?: React.ReactNode }) =>
                    inline ? (
                      <code className="bg-gray-100 text-gray-800 text-xs px-1 py-0.5 rounded font-mono">{children}</code>
                    ) : (
                      <code className="block bg-gray-900 text-gray-200 text-xs font-mono p-4 rounded overflow-x-auto whitespace-pre my-2">{children}</code>
                    ),
                  pre: ({ children }) => <>{children}</>,
                  strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                }}
              >
                {report}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {!report && !isLoading && !error && (
          <div className="border border-dashed border-gray-300 rounded p-8 text-center text-sm text-gray-400">
            Report will appear here after you submit a repository URL.
          </div>
        )}

      </div>
    </main>
  );
}