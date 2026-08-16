import React,{useState} from "react";
import "./auth.css";

export default function AuthPanel({onClose,onSignedIn}){
 const [mode,setMode]=useState("login");
 const [name,setName]=useState("");
 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");
 const [error,setError]=useState("");
 const submit=e=>{e.preventDefault();setError("");if(mode==="signup"&&!name.trim()){setError("Enter a username.");return}if(!email.includes("@")){setError("Enter a valid email.");return}if(password.length<6){setError("Password must be at least 6 characters.");return}const account={username:name.trim()||email.split("@")[0],email};localStorage.setItem("ximo-account",JSON.stringify(account));onSignedIn?.(account);onClose?.()};
 return <div className="auth-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose?.()}><section className="auth-panel" role="dialog" aria-modal="true"><button className="auth-close" onClick={onClose}>×</button><div className="auth-logo">ximo<span>.</span></div><p className="eyebrow">WELCOME TO XIMO</p><h2>{mode==="login"?"Come back to your ideas.":"Create your Ximo."}</h2><p className="auth-copy">{mode==="login"?"Save ideas and keep your collection with you.":"Join for free. You can browse Ximo without an account."}</p><form onSubmit={submit}>{mode==="signup"&&<label>Username<input value={name} onChange={e=>setName(e.target.value)} placeholder="yourname" autoComplete="username"/></label>}<label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email"/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" autoComplete={mode==="login"?"current-password":"new-password"}/></label>{error&&<p className="auth-error">{error}</p>}<button className="auth-submit">{mode==="login"?"Sign in":"Create account"}</button></form><div className="auth-divider"><span>or</span></div><button className="guest-button" onClick={onClose}>Continue browsing as guest</button><p className="auth-switch">{mode==="login"?"New to Ximo?":"Already have an account?"} <button onClick={()=>{setMode(mode==="login"?"signup":"login");setError("")}}>{mode==="login"?"Create one":"Sign in"}</button></p></section></div>;
}
