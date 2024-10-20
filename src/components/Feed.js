import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, updateDoc, doc, getDoc } from 'firebase/firestore';
import { firestoreDb } from './firebase'; 
import { auth } from './firebase'; 
import './feed.scss';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const user = auth.currentUser;

  // Fetch posts from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestoreDb, 'posts'), (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPosts(postsData);
    });
    return () => unsubscribe();
  }, []);

  const handleLike = async (postId, currentLikes) => {
    const postRef = doc(firestoreDb, 'posts', postId);
    await updateDoc(postRef, {
      likes: currentLikes + 1
    });
  };

  const handleShare = async (postId, currentShares) => {
    const postRef = doc(firestoreDb, 'posts', postId);
    await updateDoc(postRef, {
      shares: currentShares + 1
    });
  };
  
  const handleComment = async (postId, commentText) => {
    const postRef = doc(firestoreDb, 'posts', postId);
    const postSnapshot = await getDoc(postRef);
    const currentComments = postSnapshot.data().comments || [];
    await updateDoc(postRef, {
      comments: [...currentComments, { userId: user.uid, comment: commentText }]
    });
  };

  return (
    <div>
      <h2>Feed</h2>
      {posts.length === 0 ? (
        <p>No posts to show</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
            <p><strong>{post.username}</strong>: {post.content}</p>
            <p>Likes: {post.likes} | Shares: {post.shares}</p>
            <div>
              <button onClick={() => handleLike(post.id, post.likes)}>Like</button>
              <button onClick={() => handleShare(post.id, post.shares)}>Share</button>
            </div>
            <div>
              <input
                type="text"
                placeholder="Add a comment..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleComment(post.id, e.target.value);
                    e.target.value = '';
                  }
                }}
              />
              <div>
                <h4>Comments:</h4>
                {post.comments && post.comments.length > 0 ? (
                  post.comments.map((comment, index) => (
                    <p key={index}><strong>{comment.userId}</strong>: {comment.comment}</p>
                  ))
                ) : (
                  <p>No comments yet</p>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Feed;
