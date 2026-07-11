const page = document.body.dataset.page;

const navToggle = document.querySelector("[data-nav-toggle]");
const navLinks = document.querySelector("[data-nav-links]");
if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const getJson = async (path) => {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`${path} could not be loaded`);
  return response.json();
};

const escapeHtml = (text = "") =>
  String(text).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[char]);

const copyText = async (text, statusElement) => {
  try {
    await navigator.clipboard.writeText(text);
    if (statusElement) statusElement.textContent = "コピーしました。";
  } catch {
    if (statusElement) statusElement.textContent = "コピーできませんでした。手動で選択してください。";
  }
};

const markdownToHtml = (markdown = "") => {
  const lines = markdown.split(/\r?\n/);
  let html = "";
  let listOpen = false;
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      if (listOpen) {
        html += "</ul>";
        listOpen = false;
      }
      continue;
    }
    if (line.startsWith("### ")) {
      if (listOpen) html += "</ul>";
      listOpen = false;
      html += `<h3>${escapeHtml(line.slice(4))}</h3>`;
    } else if (line.startsWith("## ")) {
      if (listOpen) html += "</ul>";
      listOpen = false;
      html += `<h2>${escapeHtml(line.slice(3))}</h2>`;
    } else if (line.startsWith("# ")) {
      if (listOpen) html += "</ul>";
      listOpen = false;
      html += `<h1>${escapeHtml(line.slice(2))}</h1>`;
    } else if (line.startsWith("- ")) {
      if (!listOpen) {
        html += "<ul>";
        listOpen = true;
      }
      html += `<li>${escapeHtml(line.slice(2))}</li>`;
    } else {
      if (listOpen) {
        html += "</ul>";
        listOpen = false;
      }
      html += `<p>${escapeHtml(line)}</p>`;
    }
  }
  if (listOpen) html += "</ul>";
  return html;
};

const loadMarkdownCards = async ({ indexPath, targetSelector, searchSelector }) => {
  const target = document.querySelector(targetSelector);
  if (!target) return;
  let cards = [];
  const render = () => {
    const query = document.querySelector(searchSelector)?.value.trim().toLowerCase() || "";
    const filtered = cards.filter((item) =>
      [item.title, item.category, item.summary, item.raw].join(" ").toLowerCase().includes(query)
    );
    target.innerHTML = filtered.length ? filtered.map((item) => `
      <article class="card note">
        <ul class="meta-list">
          ${item.category ? `<li>${escapeHtml(item.category)}</li>` : ""}
          ${item.date ? `<li>${escapeHtml(item.date)}</li>` : ""}
          ${item.subject ? `<li>${escapeHtml(item.subject)}</li>` : ""}
        </ul>
        <div class="article-body">${item.html}</div>
      </article>
    `).join("") : `<p class="empty">条件に合う記事が見つかりませんでした。キーワードを変えるか、絞り込みをリセットしてください。</p>`;
  };

  try {
    const items = await getJson(indexPath);
    cards = await Promise.all(items.map(async (item) => {
      const raw = await fetch(item.file).then((res) => res.text());
      return { ...item, raw, html: markdownToHtml(raw) };
    }));
    document.querySelector(searchSelector)?.addEventListener("input", render);
    document.querySelector("[data-reset-search]")?.addEventListener("click", () => {
      document.querySelector(searchSelector).value = "";
      render();
    });
    render();
  } catch {
    target.innerHTML = `<p class="empty">コンテンツを読み込めませんでした。ローカルサーバーで開いているか確認してください。</p>`;
  }
};

if (page === "classroom-english") {
  const list = document.querySelector("[data-expression-list]");
  const fields = {
    search: document.querySelector("[data-search]"),
    scene: document.querySelector("[data-scene]"),
    state: document.querySelector("[data-state]"),
    purpose: document.querySelector("[data-purpose]"),
    strength: document.querySelector("[data-strength]"),
    age: document.querySelector("[data-age]"),
    onlyFavorites: document.querySelector("[data-only-favorites]"),
  };
  const favoriteKey = "inquiryTeacherLabFavorites";
  let expressions = [];

  const readFavorites = () => JSON.parse(localStorage.getItem(favoriteKey) || "[]");
  const writeFavorites = (ids) => localStorage.setItem(favoriteKey, JSON.stringify(ids));
  const fillSelect = (select, values, label) => {
    select.innerHTML = `<option value="">${label}</option>${[...new Set(values)].sort().map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("")}`;
  };

  const render = () => {
    const query = fields.search.value.trim().toLowerCase();
    const favorites = readFavorites();
    const filtered = expressions.filter((item) => {
      const haystack = [
        item.english, item.japanese, item.scene, item.childState, item.purpose,
        item.point, item.strength, item.age, item.gentler, item.clearer,
        item.katakana, ...(item.related || []),
      ].join(" ").toLowerCase();
      return (!query || haystack.includes(query)) &&
        (!fields.scene.value || item.sceneCategory === fields.scene.value) &&
        (!fields.state.value || item.childState === fields.state.value) &&
        (!fields.purpose.value || item.purpose === fields.purpose.value) &&
        (!fields.strength.value || item.strength === fields.strength.value) &&
        (!fields.age.value || item.age === fields.age.value) &&
        (!fields.onlyFavorites.checked || favorites.includes(item.id));
    });

    list.innerHTML = filtered.length ? filtered.map((item) => {
      const isFavorite = favorites.includes(item.id);
      return `
        <article class="card expression-card">
          <div class="expression-title">
            <div>
              <p class="eyebrow">${escapeHtml(item.sceneCategory)} / ${escapeHtml(item.purpose)}</p>
              <strong>${escapeHtml(item.english)}</strong>
              <p>${escapeHtml(item.japanese)}</p>
            </div>
            <button class="favorite" type="button" aria-label="お気に入りに追加または解除" aria-pressed="${isFavorite}" data-favorite="${escapeHtml(item.id)}">☆</button>
          </div>
          <ul class="meta-list">
            <li>強さ: ${escapeHtml(item.strength)}</li>
            <li>年齢: ${escapeHtml(item.age)}</li>
            <li>状態: ${escapeHtml(item.childState)}</li>
          </ul>
          <div class="detail-grid">
            <div><strong>使用場面</strong><br>${escapeHtml(item.scene)}</div>
            <div><strong>使用上のポイント</strong><br>${escapeHtml(item.point)}</div>
            <div><strong>より優しい表現</strong><br>${escapeHtml(item.gentler)}</div>
            <div><strong>より明確な表現</strong><br>${escapeHtml(item.clearer)}</div>
            <div><strong>発音補助</strong><br>${escapeHtml(item.katakana)}</div>
            <div><strong>関連表現</strong><br>${(item.related || []).map(escapeHtml).join(" / ")}</div>
          </div>
        </article>
      `;
    }).join("") : `<p class="empty">条件に合う表現が見つかりませんでした。条件を減らすか、リセットしてください。</p>`;
  };

  getJson("data/classroomEnglish.json").then((data) => {
    expressions = data;
    fillSelect(fields.scene, data.map((item) => item.sceneCategory), "すべての利用場面");
    fillSelect(fields.state, data.map((item) => item.childState), "すべての子どもの状態");
    fillSelect(fields.purpose, data.map((item) => item.purpose), "すべての目的");
    fillSelect(fields.strength, data.map((item) => item.strength), "すべての強さ");
    fillSelect(fields.age, data.map((item) => item.age), "すべての対象年齢");
    render();
  }).catch(() => {
    list.innerHTML = `<p class="empty">教室英語データを読み込めませんでした。</p>`;
  });

  Object.values(fields).forEach((element) => element.addEventListener("input", render));
  document.querySelector("[data-reset-filters]").addEventListener("click", () => {
    Object.entries(fields).forEach(([key, element]) => {
      if (key === "onlyFavorites") element.checked = false;
      else element.value = "";
    });
    render();
  });
  list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-favorite]");
    if (!button) return;
    const id = button.dataset.favorite;
    const favorites = readFavorites();
    writeFavorites(favorites.includes(id) ? favorites.filter((value) => value !== id) : [...favorites, id]);
    render();
  });
}

if (page === "question-maker") {
  const form = document.querySelector("[data-question-form]");
  const result = document.querySelector("[data-question-result]");
  const status = document.querySelector("[data-copy-status]");
  let templates = [];
  let lastQuestion = "";

  const renderQuestion = () => {
    const formData = new FormData(form);
    const type = formData.get("type");
    const theme = formData.get("theme") || "このテーマ";
    const subject = formData.get("subject");
    const scene = formData.get("scene");
    const candidates = templates.filter((item) => !type || item.type === type);
    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    const question = picked.template.replaceAll("{theme}", theme);
    lastQuestion = `${question}\n\n問いの種類: ${picked.type}\n期待できる思考: ${picked.thinking}\n追加質問: ${picked.followUps.join(" / ")}\n注意: ${picked.note}`;
    result.innerHTML = `
      <article class="card note">
        <ul class="meta-list"><li>${escapeHtml(formData.get("grade"))}</li><li>${escapeHtml(subject)}</li><li>${escapeHtml(scene)}</li></ul>
        <h2>${escapeHtml(question)}</h2>
        <p><strong>問いの種類：</strong>${escapeHtml(picked.type)}</p>
        <p><strong>この問いで期待できる思考：</strong>${escapeHtml(picked.thinking)}</p>
        <p><strong>教師が続けて使える追加質問：</strong>${picked.followUps.map(escapeHtml).join(" / ")}</p>
        <p><strong>問いを使う際の注意：</strong>${escapeHtml(picked.note)}</p>
      </article>
    `;
  };

  getJson("data/inquiryQuestionTemplates.json").then((data) => {
    templates = data;
    const typeSelect = form.querySelector("[name='type']");
    typeSelect.innerHTML = data.map((item) => item.type).filter((value, index, array) => array.indexOf(value) === index)
      .map((type) => `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`).join("");
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    renderQuestion();
  });
  document.querySelector("[data-new-question]").addEventListener("click", renderQuestion);
  document.querySelector("[data-copy-question]").addEventListener("click", () => copyText(lastQuestion, status));
}

if (page === "self-check") {
  const form = document.querySelector("[data-check-form]");
  const results = document.querySelector("[data-results]");
  const saved = document.querySelector("[data-saved-results]");
  const modeSelect = document.querySelector("[data-check-mode]");
  const memo = document.querySelector("[data-check-memo]");
  const storageKey = "inquiryTeacherLabCheckResults";
  let checklist = {};
  let latestText = "";

  const renderSaved = () => {
    const items = JSON.parse(localStorage.getItem(storageKey) || "[]");
    saved.innerHTML = items.length ? items.map((item, index) => `
      <article class="card">
        <ul class="meta-list"><li>${escapeHtml(item.mode)}</li><li>${escapeHtml(item.date)}</li></ul>
        <p>${escapeHtml(item.summary)}</p>
        <button class="secondary" type="button" data-delete-result="${index}">削除</button>
      </article>
    `).join("") : `<p class="empty">保存された結果はまだありません。</p>`;
  };

  const renderForm = () => {
    const mode = modeSelect.value;
    const items = checklist[mode] || [];
    form.innerHTML = items.map((label, index) => `
      <fieldset class="check-item">
        <legend>${index + 1}. ${escapeHtml(label)}</legend>
        <div class="radio-row">
          <label><input type="radio" name="q${index}" value="2" required> できた</label>
          <label><input type="radio" name="q${index}" value="1"> 一部できた</label>
          <label><input type="radio" name="q${index}" value="0"> できなかった</label>
          <label><input type="radio" name="q${index}" value="na"> 今回は必要ない</label>
        </div>
      </fieldset>
    `).join("") + `<div class="toolbar"><button type="submit">結果を見る</button><button type="button" class="secondary" data-reset-check>リセット</button></div>`;
  };

  getJson("data/lessonChecklists.json").then((data) => {
    checklist = data;
    renderForm();
    renderSaved();
  });

  modeSelect.addEventListener("change", renderForm);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const mode = modeSelect.value;
    const items = checklist[mode];
    const formData = new FormData(form);
    const needReview = [];
    const strengths = [];
    let total = 0;
    let denominator = 0;
    items.forEach((label, index) => {
      const value = formData.get(`q${index}`);
      if (value === "na") return;
      total += Number(value);
      denominator += 2;
      if (value === "2") strengths.push(label);
      if (value === "0" || value === "1") needReview.push(label);
    });
    const score = denominator ? Math.round((total / denominator) * 100) : 0;
    const next = needReview[0] || "今日うまくいったことを次回も続ける";
    latestText = `授業${mode === "before" ? "前" : "後"}セルフチェック\n強み: ${strengths.slice(0, 3).join(" / ") || "これから見つける"}\n確認が必要: ${needReview.slice(0, 5).join(" / ") || "大きな確認項目はありません"}\n次回一つだけ変えるなら: ${next}\nメモ: ${memo.value}`;
    results.innerHTML = `
      <div class="score-grid compact">
        <div class="score-box"><span>参考スコア</span><strong>${score}</strong></div>
      </div>
      <div class="callout">
        <h2>結果</h2>
        <p><strong>今回の授業の強み：</strong>${escapeHtml(strengths.slice(0, 3).join(" / ") || "次回の授業で一つ見つけましょう。")}</p>
        <p><strong>確認が必要な項目：</strong>${escapeHtml(needReview.slice(0, 5).join(" / ") || "大きな確認項目はありません。")}</p>
        <p><strong>次回一つだけ変えるなら：</strong>${escapeHtml(next)}</p>
        <p><strong>メモ：</strong>${escapeHtml(memo.value || "メモは未入力です。")}</p>
      </div>
      <div class="toolbar">
        <button type="button" data-copy-check>結果をコピー</button>
        <button type="button" class="secondary" data-save-check>ブラウザ内保存</button>
        <button type="button" class="secondary" data-print-check>印刷</button>
      </div>
      <p class="muted" data-check-status></p>
    `;
  });

  document.addEventListener("click", (event) => {
    if (event.target.matches("[data-reset-check]")) {
      form.reset();
      results.innerHTML = "";
    }
    if (event.target.matches("[data-copy-check]")) copyText(latestText, document.querySelector("[data-check-status]"));
    if (event.target.matches("[data-print-check]")) window.print();
    if (event.target.matches("[data-save-check]")) {
      const items = JSON.parse(localStorage.getItem(storageKey) || "[]");
      items.unshift({
        mode: modeSelect.value === "before" ? "授業前" : "授業後",
        date: new Date().toLocaleString("ja-JP"),
        summary: latestText,
      });
      localStorage.setItem(storageKey, JSON.stringify(items.slice(0, 10)));
      document.querySelector("[data-check-status]").textContent = "ブラウザ内に保存しました。";
      renderSaved();
    }
    const deleteButton = event.target.closest("[data-delete-result]");
    if (deleteButton) {
      const items = JSON.parse(localStorage.getItem(storageKey) || "[]");
      items.splice(Number(deleteButton.dataset.deleteResult), 1);
      localStorage.setItem(storageKey, JSON.stringify(items));
      renderSaved();
    }
  });
}

if (page === "ib-notes") {
  loadMarkdownCards({ indexPath: "content/ib-notes/index.json", targetSelector: "[data-notes]", searchSelector: "[data-note-search]" });
}

if (page === "classroom-management") {
  loadMarkdownCards({ indexPath: "content/classroom-management/index.json", targetSelector: "[data-management]", searchSelector: "[data-note-search]" });
}
