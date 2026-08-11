(() => {
  "use strict";

  function row(label, value) {
    const wrap = document.createElement("div");
    wrap.className = "history-meta";
    const strong = document.createElement("strong");
    strong.textContent = `${label}: `;
    wrap.append(strong, document.createTextNode(String(value)));
    return wrap;
  }

  function formatTime(value) {
    if (!value) return "未記録";
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString("ja-JP");
  }

  function render(output) {
    const diag = window.LifeOSStorageDiagnostics?.snapshot?.();
    output.replaceChildren();
    if (!diag) {
      output.append(row("状態", "診断機能を利用できません"));
      return;
    }

    const mirrorHealthy = diag.legacy.detected && diag.envelope.detected &&
      diag.legacy.parseOk !== false && diag.envelope.parseOk !== false;

    output.append(
      row("総合", mirrorHealthy ? "正常" : "要確認"),
      row("Storage Layer", diag.status),
      row("Schema", diag.schemaVersion || "不明"),
      row("旧データ", diag.legacy.detected ? (diag.legacy.parseOk === false ? "検出・解析エラー" : "検出") : "なし"),
      row("LifeOS Envelope", diag.envelope.detected ? (diag.envelope.parseOk === false ? "検出・解析エラー" : "検出") : "なし"),
      row("最終ミラー", formatTime(diag.envelope.updatedAt)),
      row("保存元", diag.envelope.source || "未記録"),
      row("エラー", diag.errors.length ? `${diag.errors.length}件` : "なし")
    );
  }

  function install() {
    const settings = document.getElementById("settingsView");
    if (!settings || document.getElementById("storageDiagnosticsCard")) return;

    const card = document.createElement("div");
    card.className = "card";
    card.id = "storageDiagnosticsCard";

    const title = document.createElement("h3");
    title.textContent = "ストレージ診断";
    const note = document.createElement("p");
    note.className = "muted";
    note.textContent = "保存内容そのものは表示せず、LifeOS保存基盤の状態だけを確認します。";
    const output = document.createElement("div");
    output.id = "storageDiagnosticsOutput";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "secondary full";
    button.textContent = "診断を更新";
    button.addEventListener("click", () => {
      window.LifeOSStorage?.syncNow?.();
      render(output);
    });

    card.append(title, note, output, button);
    settings.append(card);
    render(output);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();
})();
