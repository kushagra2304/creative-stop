import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, setDoc, addDoc, collection, getDoc } from 'firebase/firestore';
import { ref, set } from 'firebase/database';
import { firestoreDb, realtimeDb } from './firebase';
import { googleProvider } from './firebase';
import { useNavigate } from 'react-router-dom';
import Feed from './Feed';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './login.scss';


const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [newPostContent, setNewPostContent] = useState('');
    const [fetchedPost, setFetchedPost] = useState(null);
    const auth = getAuth();
    // const navigate = useNavigate();
    const appendGmail = (email) => `${email}@gmail.com`;

        const handleSignUp = async () => {
            const fullEmail = appendGmail(email);
            try {
                
                // Try logging in first
                const userCredential = await signInWithEmailAndPassword(auth, fullEmail, password);
                const user = userCredential.user;
                console.log('Logged in:', user);
                setUser(user);
                setIsLoggedIn(true);
                setError(''); // Clear any existing errors
            } catch (error) {
                // If the error indicates that the user is not found, create a new account
                if (error.code === 'auth/user-not-found') {
                    try {
                        const newUserCredential = await createUserWithEmailAndPassword(auth, fullEmail, password);
                        const newUser = newUserCredential.user;
                        await storeUserData(newUser);
                        console.log('Signed Up:', newUser);
                        setUser(newUser);
                        setIsLoggedIn(true);
                    } catch (signupError) {
                        console.error('Error signing up:', signupError.message);
                        setError('Error signing up: ' + signupError.message);
                    }
                } else {
                    console.error('Error logging in:', error.message);
                    setError('Error logging in: ' + error.message);
                }
            }
        };

    const fetchPost = async (postId) => {
        try {
            const postRef = doc(firestoreDb, 'posts', postId);
            const postSnapshot = await getDoc(postRef);
            if (postSnapshot.exists()) {
                console.log('Post data:', postSnapshot.data());
                setFetchedPost(postSnapshot.data());
            } else {
                console.log('No such post!');
            }
        } catch (error) {
            console.error('Error fetching post:', error.message);
        }
    };

    const handleLogin = async () => {
        try {
            const fullEmail = appendGmail(email);
            const userCredential = await signInWithEmailAndPassword(auth, fullEmail, password);
            const user = userCredential.user;
            console.log('Logged in:', user);
            setUser(user);
            setIsLoggedIn(true);
            setError(''); // Clear any existing errors
        } catch (error) {
            console.error('Error logging in:', error.message);
            setError('Error logging in: ' + error.message);
        }
    };

    const handleAnonymousSignIn = async () => {
        try {
            const userCredential = await signInAnonymously(auth);
            const user = userCredential.user;
            setIsAnonymous(true);
            setUser(user);
            console.log('Signed in anonymously:', user);
        } catch (error) {
            console.error('Error signing in anonymously:', error.message);
            setError('Error signing in anonymously: ' + error.message);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            setUser(user);
            setIsLoggedIn(true);
            console.log('Google Sign-In successful:', user);
        } catch (error) {
            console.error('Error signing in with Google:', error.message);
            setError('Error signing in with Google: ' + error.message);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            setIsLoggedIn(false);
            setUser(null);
        } catch (error) {
            console.error('Error signing out:', error.message);
        }
    };

    const storeUserData = async (user, displayName = '') => {
        try {
            const userRef = ref(realtimeDb, 'users/' + user.uid);
            await set(userRef, {
                email: user.email,
                lastLogin: new Date().toISOString(),
                displayName: displayName || user.displayName || 'Anonymous',
            });
            console.log('User data stored successfully');
        } catch (error) {
            console.error('Error storing user data:', error.message);
        }
    };

    const handleAddPost = async () => {
        if (newPostContent.trim() === '') return;
        try {
            const docRef = await addDoc(collection(firestoreDb, 'posts'), {
                content: newPostContent,
                userId: user.uid,
                username: user.displayName || user.email.split("@")[0],
                likes: 0,
                shares: 0,
                comments: [],
                createdAt: new Date(),
            });
            console.log('Post added with ID:', docRef.id);

            await fetchPost(docRef.id); // Call fetchPost with the new post ID
            setNewPostContent(''); // Clear input after posting
        } catch (error) {
            console.error('Error adding post:', error.message);
        }
    };

    const handleSetDisplayName = async () => {
        const user = auth.currentUser;
        if (!displayName.trim()) return;
        try {
            await storeUserData(user, displayName); // Store display name
            console.log('Display name set:', displayName);
            setIsLoggedIn(true);
        } catch (error) {
            console.error('Error setting display name:', error.message);
            setError('Error setting display name: ' + error.message);
        }
    };
    // const goToProfile = () => {
    //     navigate('/profile'); // Navigate to '/profile' route
    // };

    return (
        <div className='container'>
            {!isLoggedIn ? (
                <>
                    <h1 >Login</h1>
                    {!isAnonymous ? (
                        <>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)} 
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button className='btn login-btn' onClick={handleLogin}>Log In</button>
                            <button className='btn signup-btn'onClick={handleSignUp}>Sign Up</button>
                            {/* <button className='btn anonymous-btn' onClick={handleAnonymousSignIn}>Sign In Anonymously</button> */}
                            <button className='btn signin-btn' onClick={handleGoogleSignIn}>Sign in with Google</button>
                        </>
                    ) : (
                        <>
                            <h2 className='display-name-title'>Enter your display name</h2>
                            <input
                                type="text"
                                placeholder="Display Name"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                            />
                            <button className='btn display-name-btn' onClick={handleSetDisplayName}>Set Display Name</button>
                        </>
                    )}
                    {error && <p>{error}</p>}
                </>
            ) : (
                <div className='login-box'>
                    <h2 className='welcome-message'> Welcome, {user.displayName || user.email.split("@")[0]}</h2>
                    <button className='btn logout-btn' onClick={handleSignOut}>Sign Out</button>

                    <Link to="/profile">
                        <button>Go to Profile</button>
                    </Link>

                    
                    <input
                        type="text"
                        placeholder="What's on your mind?"
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                    />
                    <button className='btn post-btn' onClick={handleAddPost}>Add Post</button>
                    {/* {fetchedPost && (
                        <div className='fetched-post'>
                            <h3 className='post-title'>Fetched Post:</h3>
                            <p className='post-content'>{fetchedPost.content}</p>
                            <p className='post-autho'>By: {fetchedPost.username}</p>
                            <p className='post-stats'>Likes: {fetchedPost.likes}</p>
                            <p className='post-stats'>Shares: {fetchedPost.shares}</p>
                        </div>
                    )} */}

                    <Feed />
                </div>
            )}
        </div>
    );
};

export default Login;
