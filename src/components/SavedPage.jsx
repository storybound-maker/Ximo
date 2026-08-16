import React from "react";
import PostCard from "./PostCard";

export default function SavedPage({ posts = [], savedIds = [], onOpenPost, onToggleSave }) {
  const savedPosts = posts.filter((post) => savedIds.includes(post.id));

  return (
    <section className="saved-page">
      <div className="feed-section-heading">
        <div>
          <p className="eyebrow">YOUR COLLECTION</p>
          <h1>Saved ideas.</h1>
        </div>
        <span>{savedPosts.length} ideas</span>
      </div>

      {savedPosts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">♡</div>
          <h2>Nothing saved yet.</h2>
          <p>Tap the heart on an idea you want to keep here.</p>
        </div>
      ) : (
        <section className="feed masonry-feed">
          {savedPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              saved
              onOpen={onOpenPost}
              onToggleSave={onToggleSave}
            />
          ))}
        </section>
      )}
    </section>
  );
}
