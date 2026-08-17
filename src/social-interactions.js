const STORE_KEY = "ximo-social-interactions";

const read = () => {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || "{}"); }
  catch { return {}; }
};
const write = value => localStorage.setItem(STORE_KEY, JSON.stringify(value));
const keyFor = (title, category = "") => `${category}::${title}`;

function ensureState(key) {
  const all = read();
  if (!all[key]) all[key] = { reactions: {}, comments: [] };
  return all;
}

function reactionTotal(item) {
  return Object.values(item?.reactions || {}).reduce((sum, value) => sum + Number(value || 0), 0);
}

function renderCardStats(card) {
  const title = card.querySelector("h2")?.textContent?.trim();
  const category = card.querySelector("span")?.textContent?.trim() || "";
  if (!title) return;
  const key = keyFor(title, category);
  const item = read()[key] || { reactions: {}, comments: [] };
  let stats = card.querySelector(".social-card-stats");
  if (!stats) {
    stats = document.createElement("div");
    stats.className = "social-card-stats";
    const overlay = card.querySelector(".card-overlay");
    if (overlay) overlay.prepend(stats);
  }
  const total = reactionTotal(item);
  const comments = item.comments?.length || 0;
  stats.textContent = `${total ? `♥ ${total}` : ""}${total && comments ? "  ·  " : ""}${comments ? `💬 ${comments}` : ""}`;
  stats.hidden = !total && !comments;
}

function decorateCards() {
  document.querySelectorAll(".card").forEach(renderCardStats);
}

function mountDetail(detail) {
  if (detail.querySelector(".social-interactions")) return;
  const title = detail.querySelector(".detail-body h1")?.textContent?.trim();
  const category = detail.querySelector(".detail-category")?.textContent?.trim() || "";
  if (!title) return;
  const key = keyFor(title, category);
  const all = ensureState(key);
  write(all);
  const item = all[key];
  const panel = document.createElement("section");
  panel.className = "social-interactions";

  const heading = document.createElement("div");
  heading.className = "social-heading";
  heading.innerHTML = `<div><p class="eyebrow">COMMUNITY</p><h2>React & talk about it.</h2></div>`;
  panel.appendChild(heading);

  const reactions = document.createElement("div");
  reactions.className = "reaction-row";
  const reactionNames = ["♥", "🔥", "👏"];
  reactionNames.forEach(symbol => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "reaction-button";
    const count = Number(item.reactions?.[symbol] || 0);
    button.textContent = `${symbol} ${count}`;
    button.addEventListener("click", () => {
      const latest = ensureState(key);
      latest[key].reactions[symbol] = Number(latest[key].reactions[symbol] || 0) + 1;
      write(latest);
      button.textContent = `${symbol} ${latest[key].reactions[symbol]}`;
      decorateCards();
    });
    reactions.appendChild(button);
  });
  panel.appendChild(reactions);

  const commentForm = document.createElement("form");
  commentForm.className = "comment-form";
  commentForm.innerHTML = `<input maxlength="240" aria-label="Add a comment" placeholder="Say something about this idea..."/><button type="submit">Post</button>`;
  commentForm.addEventListener("submit", event => {
    event.preventDefault();
    const input = commentForm.querySelector("input");
    const text = input.value.trim();
    if (!text) return;
    const latest = ensureState(key);
    latest[key].comments.push({ id: Date.now(), text, createdAt: new Date().toISOString() });
    write(latest);
    input.value = "";
    renderComments();
    decorateCards();
  });
  panel.appendChild(commentForm);

  const comments = document.createElement("div");
  comments.className = "comments-list";
  panel.appendChild(comments);

  function renderComments() {
    const latest = read()[key] || { comments: [] };
    comments.innerHTML = "";
    if (!latest.comments?.length) {
      comments.innerHTML = `<p class="comments-empty">Be the first to leave a thought. 🧡</p>`;
      return;
    }
    latest.comments.slice().reverse().forEach(comment => {
      const row = document.createElement("article");
      row.className = "comment-item";
      row.innerHTML = `<div class="comment-avatar">S</div><div><p>${escapeHtml(comment.text)}</p><span>Just now</span></div>`;
      comments.appendChild(row);
    });
  }

  detail.querySelector(".detail-body")?.appendChild(panel);
  renderComments();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>\"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[char]));
}

const observer = new MutationObserver(() => {
  document.querySelectorAll(".post-detail").forEach(mountDetail);
  decorateCards();
});
observer.observe(document.body, { childList: true, subtree: true });

decorateCards();
