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

const categories = ["Home", "Cozy", "Workspace", "Bedroom", "Plants", "Kitchen", "Saved"];

function App() {
  const [active, setActive] = useState("Home");
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
    const matchesSearch = `${post.title} ${post.category}`.toLowerCase().includes(query.toLowerCase());
    const matchesTab = active === "Home" || active === "Saved" ? true : post.category === active;
    const matchesSaved = active === "Saved" ? saved.includes(post.id) : true;
    return matchesSearch && matchesTab && matchesSaved;
  });

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
    setTitle(""); setCategory("Home"); setImage(""); setImageName(""); setShowCreate(false); setActive("Home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app-shell">
      <header className="topbar"><div className="brand">ximo<span>.</span></div><div className="profile-button">S</div></header>
      <main>
        <section className="hero">
          <p className="eyebrow">YOUR SPACE. YOUR IDEAS.</p>
          <h1>Make your space<br /><span>feel like you.</span></h1>
          <p className="hero-copy">Discover rooms, setups, styles and little ideas worth saving.</p>
          <div className="search-box"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search ideas..." />{query && <button onClick={() => setQuery("")}>×</button>}</div>
        </section>
        <div className="category-row">{categories.map((item) => <button key={item} className={active === item ? "category active" : "category"} onClick={() => setActive(item)}>{item}</button>)}</div>
        <section className="feed">
          {visiblePosts.length === 0 ? <div className="empty-state"><h2>Nothing here yet.</h2><p>Try another search or save some ideas.</p></div> : visiblePosts.map((post) => (
            <article className={`card ${post.height}`} key={post.id}>
              <img src={post.image} alt={post.title} />
              <div className="card-overlay"><div><span>{post.category}</span><h2>{post.title}</h2></div><button className={saved.includes(post.id) ? "save saved" : "save"} onClick={() => toggleSave(post.id)} aria-label="Save idea">{saved.includes(post.id) ? "♥" : "♡"}</button></div>
            </article>
          ))}
        </section>
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
            <label className="field-label">Category<select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.filter((item) => item !== "Saved").map((item) => <option key={item}>{item}</option>)}</select></label>
            <button className="publish-button" type="submit" disabled={!title.trim() || !image}>Publish idea</button>
          </form>
        </div>
      )}

      <nav className={`bottom-nav ${navHidden ? "nav-hidden" : ""}`} aria-label="Main navigation">
        <button className={active === "Home" ? "nav-item active" : "nav-item"} onClick={() => setActive("Home")}><span>⌂</span><small>Home</small></button>
        <button className="nav-item" onClick={() => { setActive("Home"); document.querySelector(".search-box input")?.focus(); }}><span>⌕</span><small>Search</small></button>
        <button className="create-button" onClick={() => { setNavHidden(false); setShowCreate(true); }} aria-label="Create">+</button>
        <button className={active === "Saved" ? "nav-item active" : "nav-item"} onClick={() => setActive("Saved")}><span>♡</span><small>Saved</small></button>
        <button className="nav-item" onClick={() => setActive("Profile")}><span>◯</span><small>Profile</small></button>
      </nav>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<React.StrictMode><App /></React.StrictMode>);
