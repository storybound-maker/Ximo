import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";

const seedPosts = [
  { id: 1, title: "Warm minimal living room", category: "Home", height: "tall", image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85" },
  { id: 2, title: "A cozy reading corner", category: "Cozy", height: "short", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=85" },
  { id: 3, title: "Simple desk setup", category: "Workspace", height: "medium", image: "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=900&q=85" },
  { id: 4, title: "Soft bedroom ideas", category: "Bedroom", height: "tall", image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85" },
  { id: 5, title: "Plants that change a room", category: "Plants", height: "medium", image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=85" },
  { id: 6, title: "Clean kitchen inspiration", category: "Kitchen", height: "short", image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=85" }
];

const categories = ["Home", "Cozy", "Workspace", "Bedroom", "Plants", "Kitchen"];
const discoveryCategories = [
  { name: "Home", icon: "⌂" }, { name: "Cozy", icon: "☁" }, { name: "Workspace", icon: "▣" },
  { name: "Bedroom", icon: "◒" }, { name: "Plants", icon: "✿" }, { name: "Kitchen", icon: "◇" }
];

function App() {
  const [active, setActive] = useState("Home");
  const [view, setView] = useState("home");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState(() => JSON.parse(localStorage.getItem("ximo-saved") || "[]"));
  const [userPosts, setUserPosts] = useState(() => JSON.parse(localStorage.getItem("ximo-posts") || "[]"));
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Home");
  const [image, setImage] = useState("");
  const [imageName, setImageName] = useState("");
  const [navHidden, setNavHidden] = useState(false);

  useEffect(() => localStorage.setItem("ximo-saved", JSON.stringify(saved)), [saved]);
  useEffect(() => localStorage.setItem("ximo-posts", JSON.stringify(userPosts)), [userPosts]);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastY + 8 && currentY > 100) setNavHidden(true);
      if (currentY < lastY - 8) setNavHidden(false);
      lastY = currentY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const posts = useMemo(() => [...userPosts, ...seedPosts], [userPosts]);
  const visiblePosts = posts.filter((post) => {
    const normalizedQuery = query.trim().toLowerCase();
    const matchesSearch = !normalizedQuery || `${post.title} ${post.category}`.toLowerCase().includes(normalizedQuery);
    const matchesTab = active === "Home" || active === "Saved" || active === "Search" ? true : post.category === active;
    const matchesSaved = active === "Saved" ? saved.includes(post.id) : true;
    return matchesSearch && matchesTab && matchesSaved;
  });

  const openSearch = () => {
    setView("search"); setActive("Search"); setNavHidden(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => document.querySelector(".search-page-input")?.focus(), 120);
  };

  const chooseCategory = (item) => {
    setQuery(""); setActive(item); setView("home"); setNavHidden(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleSave = (id) => setSaved((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  const handleImage = (event) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const publish = (event) => {
    event.preventDefault();
    if (!title.trim() || !image) return;
    setUserPosts((current) => [{ id: `local-${Date.now()}`, title: title.trim(), category, height: "medium", image }, ...current]);
    setTitle(""); setCategory("Home"); setImage(""); setImageName(""); setShowCreate(false); setActive("Home"); setView("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderFeed = (postsToRender = visiblePosts) => postsToRender.length === 0 ? (
    <div className="empty-state"><div className="empty-icon">⌕</div><h2>No ideas found.</h2><p>Try a different search or explore another category.</p><button onClick={() => { setQuery(""); setActive("Search"); }}>Clear search</button></div>
  ) : (
    <section className="feed">
      {postsToRender.map((post) => (
        <article className={`card ${post.height}`} key={post.id}>
          <img src={post.image} alt={post.title} />
          <div className="card-overlay"><div><span>{post.category}</span><h2>{post.title}</h2></div><button className={saved.includes(post.id) ? "save saved" : "save"} onClick={() => toggleSave(post.id)} aria-label="Save idea">{saved.includes(post.id) ? "♥" : "♡"}</button></div>
        </article>
      ))}
    </section>
  );

  return (
    <div className="app-shell">
      <header className="topbar"><button className="brand brand-button" onClick={() => { setView("home"); setActive("Home"); setQuery(""); window.scrollTo({ top: 0, behavior: "smooth" }); }}>ximo<span>.</span></button><button className="profile-button" onClick={() => setActive("Profile")}>S</button></header>
      <main>
        {view === "search" ? (
          <section className="search-page">
            <div className="search-page-head">
              <p className="eyebrow">DISCOVER ON XIMO</p>
              <h1>Find your next<br /><span>great idea.</span></h1>
              <div className="search-box search-page-box"><span>⌕</span><input className="search-page-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search rooms, setups, styles..." autoComplete="off" />{query && <button onClick={() => setQuery("")}>×</button>}</div>
              {query ? <p className="search-result-label">{visiblePosts.length} {visiblePosts.length === 1 ? "idea" : "ideas"} for <strong>“{query}”</strong></p> : <p className="search-result-label">Explore ideas by category or start typing above.</p>}
            </div>
            {!query && <>
              <div className="discovery-heading"><h2>Explore categories</h2><span>Pick a vibe</span></div>
              <div className="discovery-grid">{discoveryCategories.map((item) => <button key={item.name} className="discovery-card" onClick={() => chooseCategory(item.name)}><span>{item.icon}</span><strong>{item.name}</strong><small>{posts.filter((post) => post.category === item.name).length} ideas</small></button>)}</div>
              <div className="discovery-heading"><h2>Popular ideas</h2><span>Fresh inspiration</span></div>
            </>}
            {renderFeed(query ? visiblePosts : posts)}
          </section>
        ) : (
          <>
            <section className="hero">
              <p className="eyebrow">YOUR SPACE. YOUR IDEAS.</p>
              <h1>Make your space<br /><span>feel like you.</span></h1>
              <p className="hero-copy">Discover rooms, setups, styles and little ideas worth saving.</p>
              <div className="search-box"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} onFocus={openSearch} placeholder="Search ideas..." /></div>
            </section>
            <div className="category-row">{["Home", ...categories].filter((item, index, arr) => arr.indexOf(item) === index).map((item) => <button key={item} className={active === item ? "category active" : "category"} onClick={() => chooseCategory(item)}>{item}</button>)}</div>
            {renderFeed()}
          </>
        )}
      </main>

      {showCreate && (
        <div className="create-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setShowCreate(false)}>
          <form className="create-panel" onSubmit={publish}>
            <div className="create-header"><div><p className="eyebrow">SHARE AN IDEA</p><h2>Create on Ximo</h2></div><button type="button" className="close-button" onClick={() => setShowCreate(false)} aria-label="Close">×</button></div>
            <label className={`upload-box ${image ? "has-image" : ""}`}>
              {image ? <img src={image} alt="Preview" /> : <><strong>+</strong><span>Choose an image</span><small>PNG, JPG or WEBP</small></>}
              <input type="file" accept="image/*" onChange={handleImage} />
            </label>
            {imageName && <p className="file-name">{imageName}</p>}
            <label className="field-label">Title<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Give your idea a name..." maxLength={80} /></label>
            <label className="field-label">Category<select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
            <button className="publish-button" type="submit" disabled={!title.trim() || !image}>Publish idea</button>
          </form>
        </div>
      )}

      <nav className={`bottom-nav ${navHidden ? "nav-hidden" : ""}`} aria-label="Main navigation">
        <button className={active === "Home" && view === "home" ? "nav-item active" : "nav-item"} onClick={() => { setView("home"); setActive("Home"); setQuery(""); window.scrollTo({ top: 0, behavior: "smooth" }); }}><span>⌂</span><small>Home</small></button>
        <button className={active === "Search" ? "nav-item active" : "nav-item"} onClick={openSearch}><span>⌕</span><small>Search</small></button>
        <button className="create-button" onClick={() => { setNavHidden(false); setShowCreate(true); }} aria-label="Create">+</button>
        <button className={active === "Saved" ? "nav-item active" : "nav-item"} onClick={() => { setView("home"); setActive("Saved"); setQuery(""); window.scrollTo({ top: 0, behavior: "smooth" }); }}><span>♡</span><small>Saved</small></button>
        <button className={active === "Profile" ? "nav-item active" : "nav-item"} onClick={() => setActive("Profile")}><span>◯</span><small>Profile</small></button>
      </nav>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<React.StrictMode><App /></React.StrictMode>);
