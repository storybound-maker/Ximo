const ITEMS = ["Home", "Search", "Saved", "Profile"];

function installFluidNav() {
  const nav = document.querySelector(".bottom-nav");
  if (!nav || nav.dataset.fluidReady === "1") return !!nav;
  nav.dataset.fluidReady = "1";

  const indicator = document.createElement("span");
  indicator.className = "ximo-fluid-indicator";
  nav.appendChild(indicator);

  const buttons = () => Array.from(nav.querySelectorAll(".nav-item"));
  const activeIndex = () => {
    const list = buttons();
    const i = list.findIndex(b => b.classList.contains("active"));
    return i >= 0 ? i : 0;
  };
  const positionFor = index => {
    const list = buttons();
    if (!list.length) return;
    const b = list[Math.max(0, Math.min(list.length - 1, index))];
    const nr = nav.getBoundingClientRect();
    const br = b.getBoundingClientRect();
    indicator.style.left = `${br.left - nr.left + br.width / 2 - 5}px`;
  };
  const go = direction => {
    const list = buttons();
    const i = activeIndex();
    const next = Math.max(0, Math.min(ITEMS.length - 1, i + direction));
    if (next !== i) list[next]?.click();
    requestAnimationFrame(() => positionFor(activeIndex()));
  };

  let dragging = false, startX = 0, lastX = 0, moved = false;
  nav.addEventListener("pointerdown", e => {
    if (e.button !== 0 || e.target.closest(".create-button")) return;
    dragging = true; moved = false; startX = lastX = e.clientX;
    nav.classList.add("fluid-dragging");
    nav.setPointerCapture?.(e.pointerId);
  });
  nav.addEventListener("pointermove", e => {
    if (!dragging) return;
    lastX = e.clientX;
    if (Math.abs(lastX - startX) < 6) return;
    moved = true;
    const delta = lastX - startX;
    const width = Math.max(140, nav.clientWidth);
    const base = activeIndex();
    const progress = Math.max(0, Math.min(ITEMS.length - 1, base - delta / (width / (ITEMS.length - 1))));
    const step = nav.clientWidth / ITEMS.length;
    indicator.style.left = `${Math.max(5, Math.min(nav.clientWidth - 15, step * progress + step / 2 - 5))}px`;
  });
  const finish = () => {
    if (!dragging) return;
    dragging = false; nav.classList.remove("fluid-dragging");
    if (moved && Math.abs(lastX - startX) > 32) go(lastX < startX ? 1 : -1);
    else positionFor(activeIndex());
  };
  nav.addEventListener("pointerup", finish);
  nav.addEventListener("pointercancel", finish);
  buttons().forEach(b => b.addEventListener("click", () => requestAnimationFrame(() => positionFor(activeIndex()))));
  window.addEventListener("resize", () => positionFor(activeIndex()), { passive: true });

  let touchStartX = 0, touchStartY = 0;
  document.addEventListener("touchstart", e => {
    if (e.touches.length !== 1 || e.target.closest(".bottom-nav,.post-detail,.create-backdrop")) return;
    touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener("touchend", e => {
    if (!touchStartX || e.target.closest(".bottom-nav,.post-detail,.create-backdrop")) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    touchStartX = touchStartY = 0;
    if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.25) return;
    go(dx < 0 ? 1 : -1);
  }, { passive: true });

  requestAnimationFrame(() => positionFor(activeIndex()));
  return true;
}

function boot() {
  if (installFluidNav()) return;
  requestAnimationFrame(boot);
}
boot();
