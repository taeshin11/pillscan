'use client'

import { useState } from "react";
import Link from "next/link";

const API_BASE = "https://api.pillscan-ai.com";

type PlanInfo = {
  plan: string;
  daily_limit: number;
  used_today: number;
  remaining: number;
  active: boolean;
};

type UsageDay = {
  day: string;
  calls: number;
  cost: number;
  avg_latency: number;
};

type UsageInfo = {
  period: string;
  total_calls: number;
  total_cost_usd: number;
  endpoints: Record<string, { calls: number; cost: number }>;
  daily_breakdown: UsageDay[];
};

export default function DashboardPage() {
  const [apiKey, setApiKey] = useState("");
  const [inputKey, setInputKey] = useState("");
  const [plan, setPlan] = useState<PlanInfo | null>(null);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!inputKey.trim()) return;
    setLoading(true);
    setError("");
    setPlan(null);
    setUsage(null);

    try {
      const [planRes, usageRes] = await Promise.all([
        fetch(`${API_BASE}/plan`, { headers: { "X-API-Key": inputKey.trim() } }),
        fetch(`${API_BASE}/usage`, { headers: { "X-API-Key": inputKey.trim() } }),
      ]);

      if (planRes.status === 401) {
        setError("Invalid API key. Please check and try again.");
        setLoading(false);
        return;
      }
      if (planRes.status === 402) {
        setError("API key exists but no payment method on file. Add a payment method to activate.");
        setLoading(false);
        return;
      }
      if (!planRes.ok) {
        setError("Could not reach API server. Make sure the server is running.");
        setLoading(false);
        return;
      }

      const planData = await planRes.json();
      const usageData = await usageRes.json();
      setPlan(planData);
      setUsage(usageData);
      setApiKey(inputKey.trim());
    } catch {
      setError("Connection failed. The API server may be offline.");
    } finally {
      setLoading(false);
    }
  }

  function copyKey() {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const maxDailyBars = usage?.daily_breakdown?.length
    ? Math.max(...usage.daily_breakdown.map((d) => d.calls), 1)
    : 1;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/developers" className="text-sm text-[var(--accent)] hover:underline">
        ← Developer API
      </Link>
      <h1 className="text-2xl font-bold mt-4 mb-2 text-[var(--text-primary)]">API Dashboard</h1>
      <p className="text-[var(--text-muted)] mb-8">View usage and billing for your API key.</p>

      {/* Key input */}
      <form onSubmit={handleLookup} className="card p-5 mb-8 flex gap-3">
        <input
          type="text"
          value={inputKey}
          onChange={(e) => setInputKey(e.target.value)}
          placeholder="ps_your_api_key_here"
          className="flex-1 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm font-mono focus:outline-none focus:border-[var(--accent)]"
          spellCheck={false}
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={loading || !inputKey.trim()}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
          style={{ backgroundColor: "var(--accent)" }}
        >
          {loading ? "Loading…" : "View"}
        </button>
      </form>

      {error && (
        <div className="card p-4 mb-6 border-l-4 text-sm text-[var(--danger)]" style={{ borderColor: "var(--danger)" }}>
          {error}
        </div>
      )}

      {plan && usage && (
        <div className="space-y-6">
          {/* Key display */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">API Key</span>
              <button
                onClick={copyKey}
                className="text-xs text-[var(--accent)] hover:underline"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <code className="text-sm text-[var(--text-primary)] break-all">{apiKey}</code>
            <div className="flex items-center gap-2 mt-2">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: plan.active ? "var(--success)" : "var(--danger)" }}
              />
              <span className="text-xs text-[var(--text-muted)]">
                {plan.active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          {/* This month */}
          <div className="grid grid-cols-3 gap-4">
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{usage.total_calls.toLocaleString()}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Calls this month</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">${usage.total_cost_usd.toFixed(4)}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Cost this month</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{plan.used_today.toLocaleString()}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Calls today</p>
            </div>
          </div>

          {/* By endpoint */}
          {Object.keys(usage.endpoints).length > 0 && (
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">
                This Month by Endpoint
              </h2>
              <div className="space-y-2">
                {Object.entries(usage.endpoints).map(([ep, data]) => (
                  <div key={ep} className="flex items-center justify-between text-sm">
                    <code className="text-[var(--accent)]">{ep}</code>
                    <div className="flex gap-6 text-right">
                      <span className="text-[var(--text-primary)]">{data.calls.toLocaleString()} calls</span>
                      <span className="text-[var(--text-muted)] w-20">${data.cost.toFixed(4)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Daily chart */}
          {usage.daily_breakdown.length > 0 && (
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-4">
                Daily Usage (last 30 days)
              </h2>
              <div className="flex items-end gap-1 h-24">
                {usage.daily_breakdown.slice(-30).map((d) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center group relative">
                    <div
                      className="w-full rounded-sm transition-all"
                      style={{
                        height: `${Math.max(4, (d.calls / maxDailyBars) * 88)}px`,
                        backgroundColor: "var(--accent)",
                        opacity: 0.7,
                      }}
                    />
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-1 hidden group-hover:block z-10 bg-[var(--text-primary)] text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                      {d.day}: {d.calls} calls · ${d.cost.toFixed(4)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
                <span>{usage.daily_breakdown[0]?.day}</span>
                <span>{usage.daily_breakdown[usage.daily_breakdown.length - 1]?.day}</span>
              </div>
            </div>
          )}

          {/* Rate limit info */}
          <div className="card p-4 text-sm text-[var(--text-muted)]">
            Rate limit: <strong className="text-[var(--text-primary)]">60 requests/minute</strong>
            {" · "}Billing: <strong className="text-[var(--text-primary)]">monthly via Lemon Squeezy</strong>
            {" · "}Questions?{" "}
            <a href="mailto:taeshinkim11@gmail.com" className="text-[var(--accent)] hover:underline">
              Contact us
            </a>
          </div>
        </div>
      )}

      {!plan && !error && !loading && (
        <div className="text-center py-12 text-[var(--text-muted)]">
          <p className="mb-4">Don&apos;t have an API key yet?</p>
          <Link
            href="/developers"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--accent)" }}
          >
            Get API Key
          </Link>
        </div>
      )}
    </div>
  );
}
