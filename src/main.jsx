import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import "./profile.css";

const seedPosts = [
  {id:1,title:"Warm minimal living room",category:"Home",height:"tall",image:"https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85",score:98},
  {id:2,title:"A cozy reading corner",category:"Cozy",height:"short",image:"https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=85",score:91},
  {id:3,title:"Simple desk setup",category:"Workspace",height:"medium",image:"https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=900&q=85",score:95},
  {id:4,title:"Soft bedroom ideas",category:"Bedroom",height:"tall",image:"https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85",score:94},
  {id:5,title:"Plants that change a room",category:"Plants",height:"medium",image:"https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=85",score:88},
  {id:6,title:"Clean kitchen inspiration",category:"Kitchen",height:"short",image:"https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=85",score:92}
];

const builtInCategories = ["Home","Cozy","Workspace","Bedroom","Plants","Kitchen"];
const categoryIcons = ["⌂","☁","▣","◒","✿","◇","✦","✧","○","△"];
const iconForCategory = (name, index=0) => categoryIcons[Math.abs([...name].reduce((a,c)=>a+c.charCodeAt(0),index)) % categoryIcons.length];

function readLocal(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; }
}

function App(){
  const [active,setActive]=useState("Home");
  const [view,setView]=useState("home");
  const [profileTab,setProfileTab]=useState("posts");
  const [query,setQuery]=useState("");
  const [recentSearches,setRecentSearches]=useState(()=>window.ximoSearch?.recent?.()||[]);
  const [selectedPost,setSelectedPost]=useState(null);
  const [saved,setSaved]=useState(()=>readLocal("ximo-saved",[]));
  const [userPosts,setUserPosts]=useState(()=>readLocal("ximo-posts",[]));
  const [customCategories,setCustomCategories]=useState(()=>readLocal("ximo-custom-categories",[]));
  const [showCreate,setShowCreate]=useState(false);
  const [showCategories,setShowCategories]=useState(false);
  const [editingCategory,setEditingCategory]=useState(null);
  const [categoryName,setCategoryName]=useState("");
  const [title,setTitle]=useState("");
  const [category,setCategory]=useState("Home");
  const [image,setImage]=useState("");
  const [imageName,setImageName]=useState("");
  const [navHidden,setNavHidden]=useState(false);
  const [feedMode,setFeedMode]=useState("for-you");
  const [feedCount,setFeedCount]=useState(1);
  const [loading,setLoading]=useState(true);
  const [toast,setToast]=useState("");

  useEffect(()=>localStorage.setItem("ximo-saved",JSON.stringify(saved)),[saved]);
  useEffect(()=>localStorage.setItem("ximo-posts",JSON.stringify(userPosts)),[userPosts]);
  useEffect(()=>localStorage.setItem("ximo-custom-categories",JSON.stringify(customCategories)),[customCategories]);
  useEffect(()=>{const t=setTimeout(()=>setLoading(false),650);return()=>clearTimeout(t)},[]);
  useEffect(()=>{let lastY=window.scrollY;const onScroll=()=>{const y=window.scrollY;if(y>lastY+8&&y>100)setNavHidden(true);if(y<lastY-8)setNavHidden(false);lastY=y};window.addEventListener("scroll",onScroll,{passive:true});return()=>window.removeEventListener("scroll",onScroll)},[]);
  useEffect(()=>{document.body.style.overflow=selectedPost||showCategories||showCreate?"hidden":"";return()=>{document.body.style.overflow=""}},[selectedPost,showCategories,showCreate]);
  useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(""),2400);return()=>clearTimeout(t)},[toast]);

  const categories=useMemo(()=>[...builtInCategories,...customCategories],[customCategories]);
  const posts=useMemo(()=>[...userPosts,...seedPosts],[userPosts]);
  useEffect(()=>{const id=new URLSearchParams(window.location.search).get("post");if(!id)return;const match=posts.find(p=>String(p.id)===id);if(match){setSelectedPost(match);setNavHidden(false)}},[posts]);
  useEffect(()=>{if(!categories.includes(category))setCategory(categories[0]||"Home")},[categories,category]);

  const filtered=useMemo(()=>posts.filter(p=>{const q=query.trim().toLowerCase();return(!q||`${p.title} ${p.category}`.toLowerCase().includes(q))&&(active==="Home"||active==="Saved"||active==="Search"||active==="Profile"||p.category===active)&&(active!=="Saved"||saved.includes(p.id))}),[posts,query,active,saved]);
  const forYou=useMemo(()=>[...posts].sort((a,b)=>{const as=saved.includes(a.id)?20:0,bs=saved.includes(b.id)?20:0;return(bs+b.score)-(as+a.score)}),[posts,saved]);
  const trending=useMemo(()=>[...posts].sort((a,b)=>b.score-a.score),[posts]);
  const fresh=useMemo(()=>[...posts].reverse(),[posts]);
  const modePosts=feedMode==="trending"?trending:feedMode==="fresh"?fresh:forYou;
  const shownFeed=modePosts.slice(0,feedCount*4);

  const rememberSearch=value=>{const next=window.ximoSearch?.remember?.(value)||recentSearches;setRecentSearches(next)};
  const clearRecentSearches=()=>{const next=window.ximoSearch?.clear?.()||[];setRecentSearches(next)};
  const removeRecentSearch=value=>{const next=window.ximoSearch?.remove?.(value)||recentSearches.filter(x=>x!==value);setRecentSearches(next)};
  const submitSearch=e=>{e?.preventDefault?.();const q=query.trim();if(!q)return;rememberSearch(q);setView("search");setActive("Search");setNavHidden(false);window.scrollTo({top:0,behavior:"smooth"})};
  const useRecentSearch=value=>{setQuery(value);rememberSearch(value);setView("search");setActive("Search");setNavHidden(false);window.scrollTo({top:0,behavior:"smooth"})};
  const goHome=()=>{setView("home");setActive("Home");setQuery("");setFeedMode("for-you");setFeedCount(1);window.scrollTo({top:0,behavior:"smooth"})};
  const openSearch=()=>{setView("search");setActive("Search");setNavHidden(false);window.scrollTo({top:0,behavior:"smooth"});setTimeout(()=>document.querySelector(".search-page-input")?.focus(),120)};
  const openSaved=()=>{setView("saved");setActive("Saved");setQuery("");setFeedCount(1);setNavHidden(false);window.scrollTo({top:0,behavior:"smooth"})};
  const chooseCategory=item=>{setQuery("");setActive(item);setView("home");setFeedMode("for-you");setFeedCount(1);setNavHidden(false);window.scrollTo({top:0,behavior:"smooth"})};
  const openProfile=()=>{setView("profile");setActive("Profile");setProfileTab("posts");setNavHidden(false);window.scrollTo({top:0,behavior:"smooth"})};
  const openPost=p=>{setSelectedPost(p);setNavHidden(false)};
  const toggleSave=id=>{const willSave=!saved.includes(id);setSaved(cur=>cur.includes(id)?cur.filter(x=>x!==id):[...cur,id]);setToast(willSave?"Saved to your Ximo ideas 🧡":"Removed from saved")};
  const sharePost=async p=>{const url=`${window.location.origin}${window.location.pathname}?post=${encodeURIComponent(p.id)}`;try{if(navigator.share){await navigator.share({title:`${p.title} — Ximo`,text:`Check out this idea on Ximo: ${p.title}`,url});setToast("Shared from Ximo 🧡");return}await navigator.clipboard.writeText(url);setToast("Post link copied 🧡")}catch(e){if(e?.name!=="AbortError"){try{await navigator.clipboard.writeText(url);setToast("Post link copied 🧡")}catch{setToast("Could not share this post")}}}};
  const handleImage=e=>{const file=e.target.files?.[0];if(!file||!file.type.startsWith("image/"))return;setImageName(file.name);const reader=new FileReader();reader.onload=()=>setImage(reader.result);reader.readAsDataURL(file)};
  const publish=e=>{e.preventDefault();if(!title.trim()||!image)return;setUserPosts(cur=>[{id:`local-${Date.now()}`,title:title.trim(),category,height:"medium",image,score:100},...cur]);setTitle("");setCategory(categories[0]||"Home");setImage("");setImageName("");setShowCreate(false);setToast("Your idea is live on Ximo 🧡");goHome()};
  const loadMore=()=>{if(shownFeed.length<modePosts.length){setFeedCount(c=>c+1);setToast("More ideas loaded")}};

  const openCategoryManager=()=>{setShowCategories(true);setEditingCategory(null);setCategoryName("");setNavHidden(false)};
  const saveCategory=()=>{
    const name=categoryName.trim().replace(/\s+/g," ");
    if(!name)return;
    if(name.length>28){setToast("Category names can be 28 characters max");return}
    const exists=[...builtInCategories,...customCategories].some(c=>c.toLowerCase()===name.toLowerCase()&&c!==editingCategory);
    if(exists){setToast("That category already exists");return}
    if(editingCategory){
      setCustomCategories(cur=>cur.map(c=>c===editingCategory?name:c));
      setUserPosts(cur=>cur.map(p=>p.category===editingCategory?{...p,category:name}:p));
      if(active===editingCategory)setActive(name);
      if(category===editingCategory)setCategory(name);
      setToast(`Renamed to ${name} 🧡`);
    }else{
      setCustomCategories(cur=>[...cur,name]);
      setCategory(name);
      setToast(`${name} created 🧡`);
    }
    setCategoryName("");setEditingCategory(null);
  };
  const startEditCategory=name=>{setEditingCategory(name);setCategoryName(name)};
  const deleteCategory=name=>{
    if(!window.confirm(`Delete “${name}”? Posts already using it will move to Home.`))return;
    setCustomCategories(cur=>cur.filter(c=>c!==name));
    setUserPosts(cur=>cur.map(p=>p.category===name?{...p,category:"Home"}:p));
    if(active===name)setActive("Home");
    if(category===name)setCategory("Home");
    setToast(`${name} deleted`);
  };

  const renderFeed=(items=filtered,mode="normal")=>items.length===0?<div className="empty-state"><div className="empty-icon">⌕</div><h2>{view==="saved"?"No saved ideas yet.":"No ideas found."}</h2><p>{view==="saved"?"Tap the heart on an idea to keep it here.":"Try a different search or explore another category."}</p><button onClick={view==="saved"?goHome:()=>{setQuery("");setActive("Search")}}>{view==="saved"?"Explore ideas":"Clear search"}</button></div>:<section className={`feed ${mode==="masonry"?"masonry-feed":""}`}>{items.map(p=><article className={`card ${p.height}`} key={p.id} onClick={()=>openPost(p)} tabIndex="0" onKeyDown={e=>e.key==="Enter"&&openPost(p)}><img src={p.image} alt={p.title} loading="lazy"/><div className="card-overlay"><div><span>{p.category}</span><h2>{p.title}</h2></div><button className={saved.includes(p.id)?"save saved":"save"} onClick={e=>{e.stopPropagation();toggleSave(p.id)}}>{saved.includes(p.id)?"♥":"♡"}</button></div></article>)}</section>;

  const savedPosts=posts.filter(p=>saved.includes(p.id));
  const profilePosts=userPosts;
  const relatedPosts=selectedPost?posts.filter(p=>p.id!==selectedPost.id&&p.category===selectedPost.category).slice(0,4):[];
  const feedTabs=[{id:"for-you",label:"For You",icon:"✦"},{id:"trending",label:"Trending",icon:"↗"},{id:"fresh",label:"Fresh",icon:"✧"}];
  const customOnly=customCategories;

  return <div className="app-shell">
    <header className="topbar"><button className="brand brand-button" onClick={goHome}>ximo<span>.</span></button><button className="profile-button" onClick={openProfile}>S</button></header>
    <main>
      {view==="profile"?<section className="profile-page">
        <div className="profile-hero"><div className="profile-avatar">S</div><div className="profile-info"><p className="eyebrow">XIMO CREATOR</p><h1>Storybound</h1><p>Ideas I want to make real.</p></div></div>
        <div className="profile-stats"><div><strong>{profilePosts.length}</strong><span>Posts</span></div><div><strong>{savedPosts.length}</strong><span>Saved</span></div><div><strong>{new Set(profilePosts.map(p=>p.category)).size}</strong><span>Topics</span></div></div>
        <div className="account-profile-actions"><button className="primary" onClick={openCategoryManager}>✦ Manage Categories</button><button onClick={()=>window.ximoLogout?.()}>Log out</button></div>
        <div className="profile-tabs"><button className={profileTab==="posts"?"active":""} onClick={()=>setProfileTab("posts")}>My Posts</button><button className={profileTab==="saved"?"active":""} onClick={()=>setProfileTab("saved")}>Saved Ideas</button></div>
        <div className="profile-heading"><h2>{profileTab==="posts"?"My posts":"Saved ideas"}</h2><span>{profileTab==="posts"?profilePosts.length:savedPosts.length} ideas</span></div>{renderFeed(profileTab==="posts"?profilePosts:savedPosts)}
      </section>
      :view==="saved"?<section className="saved-page"><div className="feed-section-heading"><div><p className="eyebrow">YOUR COLLECTION</p><h1>Saved ideas.</h1><p className="hero-copy">Everything you want to come back to.</p></div><span>{savedPosts.length} {savedPosts.length===1?"idea":"ideas"}</span></div>{renderFeed(savedPosts,"masonry")}</section>
      :view==="search"?<section className="search-page"><div className="search-page-head"><p className="eyebrow">DISCOVER ON XIMO</p><h1>Find your next<br/><span>great idea.</span></h1><form className="search-box search-page-box" onSubmit={submitSearch}><span>⌕</span><input className="search-page-input" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search rooms, setups, styles..." autoComplete="off"/>{query&&<button type="button" onClick={()=>setQuery("")}>×</button>}</form>{query?<p className="search-result-label">{filtered.length} {filtered.length===1?"idea":"ideas"} for <strong>“{query}”</strong></p>:<p className="search-result-label">Explore ideas by category or start typing above.</p>}</div>
        {!query&&recentSearches.length>0&&<div className="recent-searches"><div className="discovery-heading"><h2>Recent searches</h2><button className="recent-clear" onClick={clearRecentSearches}>Clear all</button></div><div className="recent-search-list">{recentSearches.map(item=><div className="recent-search-item" key={item}><button className="recent-search-main" onClick={()=>useRecentSearch(item)}><span>↗</span>{item}</button><button className="recent-search-remove" aria-label={`Remove ${item}`} onClick={()=>removeRecentSearch(item)}>×</button></div>)}</div></div>}
        {!query&&<><div className="discovery-heading"><h2>Explore categories</h2><span>Pick a vibe</span></div><div className="discovery-grid">{categories.map((name,i)=><button key={name} className="discovery-card" onClick={()=>{rememberSearch(name);chooseCategory(name)}}><span>{iconForCategory(name,i)}</span><strong>{name}</strong><small>{posts.filter(p=>p.category===name).length} ideas</small></button>)}</div><div className="discovery-heading"><h2>Popular ideas</h2><span>Fresh inspiration</span></div></>}{renderFeed(query?filtered:forYou,"masonry")}
      </section>
      :<><section className="hero"><p className="eyebrow">YOUR SPACE. YOUR IDEAS.</p><h1>Make your space<br/><span>feel like you.</span></h1><p className="hero-copy">Discover rooms, setups, styles and little ideas worth saving.</p><form className="search-box" onSubmit={submitSearch}><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} onFocus={openSearch} placeholder="Search ideas..."/></form></section>
        <div className="feed-switcher">{feedTabs.map(t=><button key={t.id} className={feedMode===t.id?"feed-tab active":"feed-tab"} onClick={()=>{setFeedMode(t.id);setFeedCount(1);window.scrollTo({top:0,behavior:"smooth"})}}><span>{t.icon}</span>{t.label}</button>)}</div>
        <div className="category-row">{categories.map(i=><button key={i} className={active===i?"category active":"category"} onClick={()=>chooseCategory(i)}>{i}</button>)}<button className="category category-manage" onClick={openCategoryManager}>＋ Manage</button></div>
        <div className="feed-section-heading"><div><p className="eyebrow">{feedMode==="for-you"?"CURATED FOR YOU":feedMode==="trending"?"RIGHT NOW":"JUST ADDED"}</p><h2>{feedMode==="for-you"?"Made for your taste.":feedMode==="trending"?"What people are loving.":"Fresh ideas, just in."}</h2></div><span>{shownFeed.length} ideas</span></div>
        {loading?<div className="skeleton-feed">{[1,2,3,4,5,6].map(i=><div className="skeleton skeleton-card" key={i}/>)}</div>:renderFeed(shownFeed,"masonry")}
        {shownFeed.length<modePosts.length&&<div className="load-more-wrap"><button className="load-more" onClick={loadMore}>Show me more <span>↓</span></button></div>}
        <div className="category-spotlight"><div className="feed-section-heading"><div><p className="eyebrow">EXPLORE MORE</p><h2>Find your next vibe.</h2></div></div><div className="discovery-grid">{categories.slice(0,6).map((name,i)=><button key={name} className="discovery-card" onClick={()=>chooseCategory(name)}><span>{iconForCategory(name,i)}</span><strong>{name}</strong><small>{posts.filter(p=>p.category===name).length} ideas</small></button>)}</div></div>
      </>}
    </main>

    {selectedPost&&<div className="post-detail" role="dialog" aria-modal="true"><button className="detail-close" onClick={()=>{setSelectedPost(null);if(window.location.search)window.history.replaceState({},"",window.location.pathname)}}>×</button><div className="detail-image-wrap"><img className="detail-image" src={selectedPost.image} alt={selectedPost.title}/></div><div className="detail-content"><div className="detail-meta"><span>{selectedPost.category}</span><div style={{display:"flex",gap:8,alignItems:"center"}}><button className={saved.includes(selectedPost.id)?"detail-save saved":"detail-save"} onClick={()=>toggleSave(selectedPost.id)}>{saved.includes(selectedPost.id)?"♥ Saved":"♡ Save"}</button><button onClick={()=>sharePost(selectedPost)} style={{minHeight:42,padding:"0 17px",cursor:"pointer",border:"1px solid #e5e5e5",borderRadius:999,background:"#171717",color:"#fff",fontSize:13,fontWeight:800}}>↗ Share</button></div></div><h1>{selectedPost.title}</h1><p>Save this idea to your Ximo collection or share it with someone who needs the inspiration.</p>{relatedPosts.length>0&&<div className="related-section"><div className="discovery-heading"><h2>More like this</h2><span>{selectedPost.category}</span></div><div className="related-grid">{relatedPosts.map(p=><button className="related-card" key={p.id} onClick={()=>openPost(p)}><img src={p.image} alt={p.title}/><span>{p.title}</span></button>)}</div></div>}</div></div>}

    {showCreate&&<div className="create-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setShowCreate(false)}><form className="create-panel" onSubmit={publish}><div className="create-header"><div><p className="eyebrow">SHARE AN IDEA</p><h2>Create on Ximo</h2></div><button type="button" className="close-button" onClick={()=>setShowCreate(false)}>×</button></div><label className={`upload-box ${image?"has-image":""}`}>{image?<img src={image} alt="Preview"/>:<><strong>+</strong><span>Choose an image</span><small>PNG, JPG or WEBP</small></>}<input type="file" accept="image/*" onChange={handleImage}/></label>{imageName&&<p className="file-name">{imageName}</p>}<label className="field-label">Title<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Give your idea a name..." maxLength={80}/></label><label className="field-label">Category<select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(i=><option key={i}>{i}</option>)}</select></label><button className="publish-button" type="submit" disabled={!title.trim()||!image}>Publish idea</button></form></div>}

    {showCategories&&<div className="category-manager-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setShowCategories(false)}><section className="category-manager" role="dialog" aria-modal="true"><div className="create-header"><div><p className="eyebrow">PERSONALIZE XIMO</p><h2>My Categories</h2><p className="category-manager-subtitle">Create your own spaces for organizing ideas.</p></div><button type="button" className="close-button" onClick={()=>setShowCategories(false)}>×</button></div><form className="category-create-form" onSubmit={e=>{e.preventDefault();saveCategory()}}><input value={categoryName} onChange={e=>setCategoryName(e.target.value)} maxLength={28} placeholder={editingCategory?"Rename category...":"New category name..."}/><button type="submit">{editingCategory?"Save":"Add"}</button></form>{editingCategory&&<button className="category-cancel-edit" onClick={()=>{setEditingCategory(null);setCategoryName("")}}>Cancel edit</button>}<div className="category-manager-list"><div className="category-manager-section-title"><span>Built-in</span><small>{builtInCategories.length}</small></div>{builtInCategories.map((name,i)=><div className="category-manager-item" key={name}><span className="category-manager-icon">{iconForCategory(name,i)}</span><strong>{name}</strong><small>Default</small></div>)}<div className="category-manager-section-title custom-title"><span>Your categories</span><small>{customOnly.length}</small></div>{customOnly.length===0?<div className="category-manager-empty"><span>✦</span><strong>No personal categories yet</strong><p>Try “Gaming”, “Travel”, “Business” or anything that fits your ideas.</p></div>:customOnly.map((name,i)=><div className="category-manager-item" key={name}><span className="category-manager-icon custom">{iconForCategory(name,i)}</span><strong>{name}</strong><div className="category-manager-actions"><button onClick={()=>startEditCategory(name)}>Edit</button><button className="danger" onClick={()=>deleteCategory(name)}>Delete</button></div></div>)}</div></section></div>}

    {toast&&<div className="toast"><span>●</span> {toast}</div>}
    <nav className={`bottom-nav ${navHidden?"nav-hidden":""}`}><button className={active==="Home"&&view==="home"?"nav-item active":"nav-item"} onClick={goHome}><span>⌂</span><small>Home</small></button><button className={active==="Search"?"nav-item active":"nav-item"} onClick={openSearch}><span>⌕</span><small>Search</small></button><button className="create-button" onClick={()=>{setNavHidden(false);setShowCreate(true)}}>+</button><button className={active==="Saved"?"nav-item active":"nav-item"} onClick={openSaved}><span>♡</span><small>Saved</small></button><button className={active==="Profile"?"nav-item active":"nav-item"} onClick={openProfile}><span>◯</span><small>Profile</small></button></nav>
  </div>
}

ReactDOM.createRoot(document.getElementById("root")).render(<React.StrictMode><App/></React.StrictMode>);
