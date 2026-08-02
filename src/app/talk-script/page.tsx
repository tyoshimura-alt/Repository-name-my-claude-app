"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DEFAULT_TALK_SCRIPT,
  IndustryHook,
  ObjectionPair,
  ScriptStep,
  TalkScript,
  createId,
} from "@/lib/talk-script";

const STORAGE_KEY = "talk-script-data";

export default function TalkScriptPage() {
  const [script, setScript] = useState<TalkScript>(DEFAULT_TALK_SCRIPT);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setScript(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(script));
  }, [script, loaded]);

  function updateStep(id: string, patch: Partial<ScriptStep>) {
    setScript((s) => ({
      ...s,
      steps: s.steps.map((step) => (step.id === id ? { ...step, ...patch } : step)),
    }));
  }

  function updateIndustryHook(id: string, patch: Partial<IndustryHook>) {
    setScript((s) => ({
      ...s,
      industryHooks: s.industryHooks.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    }));
  }

  function addIndustryHook() {
    setScript((s) => ({
      ...s,
      industryHooks: [
        ...s.industryHooks,
        { id: createId("ind"), industry: "", tasks: "", hook: "" },
      ],
    }));
  }

  function removeIndustryHook(id: string) {
    setScript((s) => ({
      ...s,
      industryHooks: s.industryHooks.filter((row) => row.id !== id),
    }));
  }

  function updateObjection(id: string, patch: Partial<ObjectionPair>) {
    setScript((s) => ({
      ...s,
      objections: s.objections.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    }));
  }

  function addObjection() {
    setScript((s) => ({
      ...s,
      objections: [...s.objections, { id: createId("obj"), objection: "", rebuttal: "" }],
    }));
  }

  function removeObjection(id: string) {
    setScript((s) => ({
      ...s,
      objections: s.objections.filter((row) => row.id !== id),
    }));
  }

  function resetToDefault() {
    if (confirm("編集内容を破棄して初期状態に戻しますか？")) {
      setScript(DEFAULT_TALK_SCRIPT);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white/80 backdrop-blur border-b border-gray-200 px-4 py-4 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div>
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">
              ← ホームに戻る
            </Link>
            <h1 className="text-lg font-semibold text-gray-800 mt-1">
              📞 AIテレアポ トークスクリプト管理
            </h1>
          </div>
          <button
            onClick={resetToDefault}
            className="text-xs font-medium rounded-full border border-gray-300 px-3 py-1.5 text-gray-600 hover:bg-gray-100 shrink-0"
          >
            初期状態に戻す
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          写真から書き起こした内容です。文言に誤りがある場合は下の各項目を直接編集してください（自動保存されます）。
        </p>

        {/* Title / flow / point */}
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 space-y-3">
          <label className="block">
            <span className="text-xs font-semibold text-gray-500">タイトル</span>
            <input
              value={script.title}
              onChange={(e) => setScript((s) => ({ ...s, title: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-gray-500">流れ</span>
            <input
              value={script.flow}
              onChange={(e) => setScript((s) => ({ ...s, flow: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-gray-500">ポイント</span>
            <textarea
              value={script.point}
              onChange={(e) => setScript((s) => ({ ...s, point: e.target.value }))}
              rows={2}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </label>
        </section>

        {/* Steps */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">基本トーク（全業種共通の型）</h2>
          {script.steps.map((step) => (
            <div key={step.id} className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 space-y-2">
              <input
                value={step.label}
                onChange={(e) => updateStep(step.id, { label: e.target.value })}
                className="w-full text-sm font-semibold text-gray-800 border-0 focus:outline-none focus:ring-0 p-0"
              />
              <textarea
                value={step.text}
                onChange={(e) => updateStep(step.id, { text: e.target.value })}
                rows={2}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
          ))}
        </section>

        {/* Industry hooks */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">
              業種別フック（③に差し込む一言）
            </h2>
            <button
              onClick={addIndustryHook}
              className="text-xs font-medium rounded-full bg-gray-800 text-white px-3 py-1.5 hover:bg-gray-700"
            >
              + 行を追加
            </button>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-left text-xs text-gray-500">
                  <th className="px-3 py-2 w-28">業種</th>
                  <th className="px-3 py-2">刺さる業務</th>
                  <th className="px-3 py-2">事例フック（言い切り形）</th>
                  <th className="px-2 py-2 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {script.industryHooks.map((row) => (
                  <tr key={row.id} className="border-t border-gray-100 align-top">
                    <td className="px-3 py-2">
                      <input
                        value={row.industry}
                        onChange={(e) => updateIndustryHook(row.id, { industry: e.target.value })}
                        className="w-full border-0 focus:outline-none focus:ring-0 font-medium p-0"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={row.tasks}
                        onChange={(e) => updateIndustryHook(row.id, { tasks: e.target.value })}
                        className="w-full border-0 focus:outline-none focus:ring-0 p-0"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={row.hook}
                        onChange={(e) => updateIndustryHook(row.id, { hook: e.target.value })}
                        className="w-full border-0 focus:outline-none focus:ring-0 p-0"
                      />
                    </td>
                    <td className="px-2 py-2 text-right">
                      <button
                        onClick={() => removeIndustryHook(row.id)}
                        className="text-gray-400 hover:text-red-500 text-xs"
                        aria-label="削除"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Objections */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">断り文句・切り返し（最小セット）</h2>
            <button
              onClick={addObjection}
              className="text-xs font-medium rounded-full bg-gray-800 text-white px-3 py-1.5 hover:bg-gray-700"
            >
              + 行を追加
            </button>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-left text-xs text-gray-500">
                  <th className="px-3 py-2 w-40">断り文句</th>
                  <th className="px-3 py-2">切り返し</th>
                  <th className="px-2 py-2 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {script.objections.map((row) => (
                  <tr key={row.id} className="border-t border-gray-100 align-top">
                    <td className="px-3 py-2">
                      <input
                        value={row.objection}
                        onChange={(e) => updateObjection(row.id, { objection: e.target.value })}
                        className="w-full border-0 focus:outline-none focus:ring-0 font-medium p-0"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={row.rebuttal}
                        onChange={(e) => updateObjection(row.id, { rebuttal: e.target.value })}
                        className="w-full border-0 focus:outline-none focus:ring-0 p-0"
                      />
                    </td>
                    <td className="px-2 py-2 text-right">
                      <button
                        onClick={() => removeObjection(row.id)}
                        className="text-gray-400 hover:text-red-500 text-xs"
                        aria-label="削除"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
