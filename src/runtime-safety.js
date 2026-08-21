(() => {
  const safeArray = (key, fallback = []) => {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "null");
      return Array.isArray(value) ? value : fallback;
    } catch {
      return fallback;
    }
  };

  try {
    const saved = safeArray("ximo-saved").filter(id => typeof id === "string" || typeof id === "number");
    localStorage.setItem("ximo-saved", JSON.stringify(saved));

    const posts = safeArray("ximo-posts").filter(post => post && typeof post === "object");
    localStorage.setItem("ximo-posts", JSON.stringify(posts));

    const categories = safeArray("ximo-custom-categories").filter(category => typeof category === "string" && category.trim());
    localStorage.setItem("ximo-custom-categories", JSON.stringify(categories));

    const collections = safeArray("ximo-collections").map(collection => ({
      ...collection,
      id: collection?.id || `collection-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: typeof collection?.name === "string" ? collection.name : "Untitled collection",
      description: typeof collection?.description === "string" ? collection.description : "",
      postIds: Array.isArray(collection?.postIds) ? collection.postIds : [],
      createdAt: Number(collection?.createdAt) || Date.now()
    }));
    localStorage.setItem("ximo-collections", JSON.stringify(collections));
  } catch {
    // If storage is unavailable, Ximo's in-memory fallbacks can still render.
  }

  const placeholder = () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 700"><rect width="900" height="700" fill="#fff1e8"/><circle cx="450" cy="300" r="90" fill="#ff6a00" opacity=".12"/><text x="450" y="320" text-anchor="middle" font-family="Arial,sans-serif" font-size="44" font-weight="700" fill="#ff6a00">ximo.</text><text x="450" y="380" text-anchor="middle" font-family="Arial,sans-serif" font-size="20" fill="#777">Image unavailable</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  document.addEventListener("error", event => {
    const image = event.target;
    if (!(image instanceof HTMLImageElement) || image.dataset.ximoFallback === "1") return;
    image.dataset.ximoFallback = "1";
    image.src = placeholder();
  }, true);
})();
