import React, { useState, useEffect } from "react";
import { auth, firestoreDb } from "./firebase";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import './profile.scss'
const Profile = () => {
  const [content, setContent] = useState("");
  const [posts, setPosts] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(firestoreDb, "posts"),
      where("userId", "==", user.uid),
      // orderBy("createdAt","desc"),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(userPosts);
    });

    return () => unsubscribe();
  }, [user]);

  const handlePost = async () => {
    if (!content.trim()) return;

    try {
      await addDoc(collection(firestoreDb, "posts"), {
        content: content,
        userId: user.uid,
        username: user.displayName || user.email.split("@")[0],
        createdAt: new Date(),
      });
      setContent("");
    } catch (error) {
      console.error("Error adding post:", error);
    }
  };

  if (!user) {
    return <p>Please log in to see your profile.</p>;
  }
  const handleLike = async (postId) => {
    const postRef = doc(firestoreDb, 'posts', postId);
    const postSnap = await getDoc(postRef);
    const post = postSnap.data();

    const currentLikes = typeof post.likes === 'number' ? post.likes : 0;
    await updateDoc(postRef, {
      likes: currentLikes + 1
    });
  };

  const handleComment = async (postId, commentText) => {
    const postRef = doc(firestoreDb, "posts", postId);
    const postSnap = await getDoc(postRef);
    const post = postSnap.data();

    const currentComments = Array.isArray(post.comments) ? post.comments : [];

    await updateDoc(postRef, {
      comments: [...currentComments, { text: commentText, userId: user.uid, username: user.email.split('@')[0] }]
    });
  };
  const handleShare = async (postId) => {
    const postRef = doc(firestoreDb, 'posts', postId);
    const postSnap = await getDoc(postRef);
    const post = postSnap.data();

    const currentShares = typeof post.shares === 'number' ? post.shares : 0;
    await updateDoc(postRef, {
      shares: currentShares + 1
    });
  };

  return (
    <div>
      <h2>{user.email.split("@")[0]}'s Profile</h2>
      <textarea
        placeholder="Write your story here!"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button onClick={handlePost}>Post</button>
      <Link to="/feed">
        <button>Back to Feed</button>
      </Link>

      <h3>Your Posts</h3>
      <div>
        {posts.length === 0 ? (
          <p>No posts yet</p>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              style={{
                border: "1px solid #ccc",
                margin: "10px 0",
                padding: "10px",
              }}
            >
              <strong>{post.username}</strong>
              <p>{post.content}</p>
              <small>
                {post.createdAt?.toDate
                  ? post.createdAt.toDate().toLocaleString()
                  : "Invalid Date"}
              </small>

              <button onClick={() => handleLike(post.id, post.likes)}>
                Like ({post.likes})
              </button>
              <button onClick={() => handleShare(post.id, post.shares)}>
                Share ({post.shares})
              </button>
              <div>
                <h4>Comments:</h4>
                {(post.comments || []).map((comment, index) => (
                  <p key={index}>
                    {comment.username}: {comment.text}
                  </p>
                ))}
                <input
                  type="text"
                  placeholder="Add a comment"
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      handleComment(post.id, e.target.value);
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Profile;
