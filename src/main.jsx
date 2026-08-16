import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";

const posts = [
  { id: 1, title: "Warm minimal living room", category: "Home", height: "tall", image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85" },
  { id: 2, title: "A cozy reading corner", category: "Cozy", height: "short", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=85" },
  { id: 3, title: "Simple desk setup", category: "Workspace", height: "medium", image: "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=900&q=85" },
  { id: 4, title: "Soft bedroom ideas", category: "Bedroom", height: "tall", image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85" },
  { id: 5, title: "Plants that change a room", category: "Plants", height: "medium", image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=85" },
  { id: 6, title: "Clean kitchen inspiration", category: "Kitchen", height: "short", image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=85" }
];

function App() {
  const [active, setActive] = useState("Home");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState([]);

  const visiblePosts = posts.filter((post) => {
    const matchesSearch = `${post.title} ${post.category}`.toLowerCase().includes(query.toLowerCase());
    const matchesTab = active === "Home" || active === "Saved" ? true : post.category === active;
    const matchesSaved = active === "Saved" ? saved.includes(post.id) : true;
    return matchesSearch && matchesTab && matchesSaved;
  });

  const toggleSave = (id) => {
    setSaved((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">ximo<span>.</span></div>
        <div className="profile-button">S</div>
      </header>

      <main>
        <section className="hero">
          <p className="eyebrow">YOUR SPACE. YOUR IDEAS.</p>
          <h1>Make your space<br /><span>feel like you.</span></h1>
          <p className="hero-copy">Discover rooms, setups, styles and little ideas worth saving.</p>
          <div className="search-box">
            <span>⌕</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search ideas..." />
            {query && <button onClick={() => setQuery("")}>×</button>}
          </div>
        </section>

        <div className="category-row">
          {["Home", "Cozy", "Workspace", "Bedroom", "Plants", "Kitchen", "Saved"].map((category) => (
            <button key={category} className={active === category ? "category active" : "category"} onClick={() => setActive(category)}>
              {category}
            </button>
          ))}
        </div>

        <section className="feed">
          {visiblePosts.length === 0 ? (
            <div className="empty-state"><h2>Nothing here yet.</h2><p>Try another search or save some ideas.</p></div>
          ) : (
            visiblePosts.map((post) => (
              <article className={`card ${post.height}`} key={post.id}>
                <img src={post.image} alt={post.title} />
                <div className="card-overlay">
                  <div><span>{post.category}</span><h2>{post.title}</h2></div>
                  <button className={saved.includes(post.id) ? "save saved" : "save"} onClick={() => toggleSave(post.id)} aria-label="Save idea">
                    {saved.includes(post.id) ? "♥" : "♡"}
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      </main>

      <nav className="bottom-nav">
        <button className={active === "Home" ? "nav-item active" : "nav-item"} onClick={() => setActive("Home")}><span>⌂</span><small>Home</small></button>
        <button className="nav-item" onClick={() => document.querySelector(".search-box input")?.focus()}><span>⌕</span><small>Search</small></button>
        <button className="create-button" onClick={() => alert("Create is coming next!")}>+</button>
        <button className={active === "Saved" ? "nav-item active" : "nav-item"} onClick={() => setActive("Saved")}><span>♡</span><small>Saved</small></button>
        <button className="nav-item"><span>◯</span><small>Profile</small></button>
      </nav>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
