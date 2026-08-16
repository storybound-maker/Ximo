const NAV_ITEMS = ["Home", "Search", "Saved", "Profile"];
let nav = null;
let dot = null;
let activeIndex = 0;
let dragging = false;
let startX = 0;
let currentX = 0;
let moved = false;
let swipeStartX = 0;
let swipeStartY = 0;
let swipeTracking = false;

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const currentNavIndex = () => {
  const active = document.querySelector(".bottom-nav .nav-item.active");
  const buttons = [...document.querySelectorAll(".bottom-nav .nav-item")];
  const i = buttons.indexOf(active);
  return i >= 0 ? clamp(i, 0, NAV_ITEMS.length - 1) : activeIndex;
};
const updateIndicator = (index, animate = true) => {
  activeIndex = clamp(index, 0, NAV_ITEMS.length - 1);
  if (!nav || !dot) return;
  dot.style.transition = animate ? "transform .24s cubic-bezier(.2,.8,.2,1)" : "none";
  dot.style.transform = `translateX(${activeIndex * 100}%)`;
  document.body.dataset.ximoSection = NAV_ITEMS[activeIndex];
};
const goTo = index => {
  const buttons = [...document.querySelectorAll(".bottom-nav .nav-item")];
  const target = buttons[clamp(index, 0, buttons.length - 1)];
  if (!target) return;
  target.click();
  requestAnimationFrame(() => updateIndicator(currentNavIndex()));
};
const install = () => {
  const nextNav = document.querySelector(".bottom-nav");
  if (!nextNav || nextNav === nav) return;
  nav = nextNav;
  nav.dataset.fluidReady = "1";
  const track = document.createElement("span");
  track.className = "ximo-fluid-track";
  const rail = document.createElement("span");
  rail.className = "ximo-fluid-rail";
  dot = document.createElement("span");
  dot.className = "ximo-fluid-dot";
  track.appendChild(rail);
  track.appendChild(dot);
  nav.prepend(track);

  const onDown = e => {
    if (e.target.closest(".create-button")) return;
    dragging = true; moved = false; startX = currentX = e.clientX;
    nav.classList.add("is-dragging");
    nav.setPointerCapture?.(e.pointerId);
  };
  const onMove = e => {
    if (!dragging) return;
    currentX = e.clientX;
    if (Math.abs(currentX - startX) > 7) moved = true;
    if (!moved) return;
    const width = Math.max(140, nav.clientWidth / NAV_ITEMS.length);
    const delta = currentX - startX;
    const progress = clamp(activeIndex - delta / width, 0, NAV_ITEMS.length - 1);
    dot.style.transition = "none";
    dot.style.transform = `translateX(${progress * 100}%)`;
  };
  const onUp = e => {
    if (!dragging) return;
    dragging = false; nav.classList.remove("is-dragging");
    if (moved) {
      const delta = currentX - startX;
      if (Math.abs(delta) > 32) goTo(activeIndex + (delta < 0 ? 1 : -1));
      else updateIndicator(activeIndex);
    }
  };
  nav.addEventListener("pointerdown", onDown);
  nav.addEventListener("pointermove", onMove);
  nav.addEventListener("pointerup", onUp);
  nav.addEventListener("pointercancel", onUp);
  [...nav.querySelectorAll(".nav-item")].forEach((button, i) => button.addEventListener("click", () => {
    setTimeout(() => updateIndicator(i), 0);
  }));
  updateIndicator(currentNavIndex(), false);
};

const onPagePointerDown = e => {
  if (e.target.closest(".bottom-nav,.post-detail,.create-backdrop,.account-settings,#ximo-auth-root,input,textarea,select,button,a")) return;
  swipeTracking = true; swipeStartX = e.clientX; swipeStartY = e.clientY;
};
const onPagePointerUp = e => {
  if (!swipeTracking) return;
  swipeTracking = false;
  const dx = e.clientX - swipeStartX;
  const dy = e.clientY - swipeStartY;
  if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.25) return;
  const i = currentNavIndex();
  goTo(i + (dx < 0 ? 1 : -1));
};

document.addEventListener("pointerdown", onPagePointerDown, { passive: true });
document.addEventListener("pointerup", onPagePointerUp, { passive: true });
const boot = () => install();
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true }); else boot();
new MutationObserver(install).observe(document.body, { childList: true });
