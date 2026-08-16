import React from "react";

export default function PostCard({ post, saved = false, onOpen, onToggleSave }) {
  return (
    <article
      className={`card ${post.height || "medium"}`}
      onClick={() => onOpen?.(post)}
      tabIndex="0"
      onKeyDown={(event) => {
        if (event.key === "Enter") onOpen?.(post);
      }}
    >
      <img src={post.image} alt={post.title} loading="lazy" />
      <div className="card-overlay">
        <div>
          <span>{post.category}</span>
          <h2>{post.title}</h2>
        </div>
        <button
          className={saved ? "save saved" : "save"}
          onClick={(event) => {
            event.stopPropagation();
            onToggleSave?.(post.id);
          }}
          aria-label={saved ? "Remove from saved" : "Save idea"}
        >
          {saved ? "♥" : "♡"}
        </button>
      </div>
    </article>
  );
}
