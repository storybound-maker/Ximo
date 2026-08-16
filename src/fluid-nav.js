const NAV_ITEMS = ["Home", "Search", "Saved", "Profile"];
const state = { index: 0, dragging: false, startX: 0, currentX: 0, moved: false };
const getIndex = () => Math.max(0, NAV_ITEMS.indexOf(document.body.dataset.ximoSection || "Home"));
const setIndex = (i) => {
  const index = Math.max(0, Math.min(NAV_ITEMS.length - 1, i));
  document.body.dataset.ximoSection = NAV_ITEMS[index];
  const nav = document.querySelector(".bottom-nav");
  if (!nav) return;
  nav.style.setProperty("--ximo-progress", String(index));
  nav.querySelectorAll(".ximo-fluid-dot").forEach(dot => dot.style.transform = `translateX(${index * 100}%)`);
};
const go = (index) => {
  const buttons = document.querySelectorAll(".bottom-nav .nav-item");
  const button = buttons[index];
  if (button && !button.disabled) button.click();
  setIndex(index);
};
const install = () => {
  const nav = document.querySelector(".bottom-nav");
  if (!nav || nav.dataset.fluidReady === "1") return;
  nav.dataset.fluidReady = "1";
  const track = document.createElement("span");
  track.className = "ximo-fluid-track";
  const dot = document.createElement("span");
  dot.className = "ximo-fluid-dot";
  track.appendChild(dot);
  nav.prepend(track);
  const onDown = e => {
    if (e.target.closest(".create-button")) return;
    state.dragging = true; state.moved = false; state.startX = e.clientX; state.currentX = e.clientX;
    nav.setPointerCapture?.(e.pointerId); nav.classList.add("is-dragging");
  };
  const onMove = e => {
    if (!state.dragging) return;
    state.currentX = e.clientX;
    if (Math.abs(state.currentX - state.startX) > 8) state.moved = true;
    if (!state.moved) return;
    const delta = state.currentX - state.startX;
    const progress = Math.max(0, Math.min(NAV_ITEMS.length - 1, getIndex() - delta / Math.max(120, nav.clientWidth / 2)));
    dot.style.transform = `translateX(${progress * 100}%)`;
  };
  const onUp = e => {
    if (!state.dragging) return;
    state.dragging = false; nav.classList.remove("is-dragging");
    if (state.moved) {
      const delta = state.currentX - state.startX;
      if (Math.abs(delta) > 35) go(getIndex() + (delta < 0 ? 1 : -1)); else setIndex(getIndex());
    }
  };
  nav.addEventListener("pointerdown", onDown);
  nav.addEventListener("pointermove", onMove);
  nav.addEventListener("pointerup", onUp);
  nav.addEventListener("pointercancel", onUp);
  nav.querySelectorAll(".nav-item").forEach((button, i) => button.addEventListener("click", () => setIndex(i)));
  setIndex(getIndex());
};
const boot = () => install();
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true }); else boot();
new MutationObserver(install).observe(document.body, { childList: true });
