(() => {
  const safeRead = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch { localStorage.setItem(key, JSON.stringify(fallback)); return fallback; }
  };
  const safeWrite = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} };

  const saved = safeRead("ximo-saved", []);
  safeWrite("ximo-saved", Array.isArray(saved) ? saved : []);

  const posts = safeRead("ximo-posts", []);
  safeWrite("ximo-posts", Array.isArray(posts) ? posts.filter(p => p && p.id != null && p.title && p.category && p.image) : []);

  const categories = safeRead("ximo-custom-categories", []);
  safeWrite("ximo-custom-categories", Array.isArray(categories) ? categories.filter(c => typeof c === "string" && c.trim()).map(c => c.trim()) : []);

  const collections = safeRead("ximo-collections", []);
  safeWrite("ximo-collections", Array.isArray(collections) ? collections.filter(c => c && c.id != null && c.name).map(c => ({
    ...c,
    postIds: Array.isArray(c.postIds) ? c.postIds : [],
    description: typeof c.description === "string" ? c.description : ""
  })) : []);
})();
