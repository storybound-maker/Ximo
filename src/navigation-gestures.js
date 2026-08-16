const ORDER = ["Home", "Search", "Saved", "Profile"];
const getActive = () => document.querySelector(".nav-item.active");
const getItems = () => [...document.querySelectorAll(".bottom-nav .nav-item")].filter(Boolean);

function goTo(index) {
  const items = getItems();
  if (index < 0 || index >= ORDER.length || !items[index]) return;
  items[index].click();
}

function addIndicator(nav) {
  if (nav.querySelector(".nav-fluid-dot")) return;
  const dot = document.createElement("span");
  dot.className = "nav-fluid-dot";
  nav.appendChild(dot);
  const move = (index, animate = true) => {
    const items = getItems();
    const item = items[index];
    if (!item) return;
    const navBox = nav.getBoundingClientRect();
    const itemBox = item.getBoundingClientRect();
    dot.style.transition = animate ? "left .24s cubic-bezier(.2,.8,.2,1)" : "none";
    dot.style.left = `${itemBox.left - navBox.left + itemBox.width / 2}px`;
  };
  nav._ximoMoveDot = move;
  move(Math.max(0, ORDER.findIndex(x => x === (getActive()?.querySelector("small")?.textContent || "Home"))), false);
}

function syncIndicator() {
  const nav = document.querySelector(".bottom-nav");
  if (!nav || !nav._ximoMoveDot) return;
  const items = getItems();
  const active = items.findIndex(i => i.classList.contains("active"));
  if (active >= 0) nav._ximoMoveDot(active, true);
}

function install() {
  const nav = document.querySelector(".bottom-nav");
  if (!nav) return;
  addIndicator(nav);
  if (nav.dataset.gesturesInstalled) return;
  nav.dataset.gesturesInstalled = "1";

  let dragging = false;
  let dragIndex = 0;
  const setFromX = x => {
    const items = getItems();
    if (!items.length) return;
    let best = 0, distance = Infinity;
    items.forEach((item, i) => {
      const box = item.getBoundingClientRect();
      const center = box.left + box.width / 2;
      const d = Math.abs(center - x);
      if (d < distance) { distance = d; best = i; }
    });
    dragIndex = Math.min(best, ORDER.length - 1);
    nav._ximoMoveDot?.(dragIndex, false);
  };

  nav.addEventListener("pointerdown", e => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (e.target.closest(".create-button")) return;
    dragging = true;
    nav.classList.add("nav-dragging");
    nav.setPointerCapture?.(e.pointerId);
    setFromX(e.clientX);
  });
  nav.addEventListener("pointermove", e => {
    if (dragging) setFromX(e.clientX);
  });
  const endDrag = e => {
    if (!dragging) return;
    dragging = false;
    nav.classList.remove("nav-dragging");
    nav._ximoMoveDot?.(dragIndex, true);
    goTo(dragIndex);
    try { nav.releasePointerCapture?.(e.pointerId); } catch {}
  };
  nav.addEventListener("pointerup", endDrag);
  nav.addEventListener("pointercancel", endDrag);

  const observer = new MutationObserver(() => {
    addIndicator(nav);
    requestAnimationFrame(syncIndicator);
  });
  observer.observe(nav, {subtree:true, attributes:true, attributeFilter:["class"]});
}

let swipeStartX = 0;
let swipeStartY = 0;
let swipeTarget = null;
document.addEventListener("touchstart", e => {
  swipeTarget = e.target;
  swipeStartX = e.touches[0].clientX;
  swipeStartY = e.touches[0].clientY;
}, {passive:true});
document.addEventListener("touchend", e => {
  if (!swipeTarget || document.querySelector(".post-detail,.create-backdrop,#ximo-auth-root:not([hidden])")) return;
  if (swipeTarget.closest("input,textarea,select,button,.card,.bottom-nav,.discovery-card")) return;
  const end = e.changedTouches[0];
  const dx = end.clientX - swipeStartX;
  const dy = end.clientY - swipeStartY;
  if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.25) return;
  const active = document.querySelector(".nav-item.active");
  const items = getItems();
  let index = items.indexOf(active);
  if (index < 0) index = 0;
  if (dx < 0) index += 1; else index -= 1;
  goTo(Math.max(0, Math.min(ORDER.length - 1, index)));
}, {passive:true});

const boot = () => {
  install();
  setTimeout(install, 150);
  setTimeout(install, 600);
};
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
