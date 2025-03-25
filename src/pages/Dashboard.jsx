import React, { useState, useEffect } from 'react';
import { auth } from "../firebase";
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, push, set, remove, get } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';

const Dashboard = () => {
    const [blogs, setBlogs] = useState([]);
    const [newTitle, setNewTitle] = useState('');
    const [newBody, setNewBody] = useState('');
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const db = getDatabase();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchBlogs(currentUser.uid);
            } else {
                navigate('/login');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const fetchBlogs = async (userId) => {
        try {
            const blogsRef = ref(db, 'blogs');
            const snapshot = await get(blogsRef);
            const data = snapshot.val();
            const fetchedBlogs = data
                ? Object.keys(data).map(key => ({ id: key, ...data[key] }))
                : [];
            const userBlogs = fetchedBlogs.filter(blog => blog.userId === userId);
            setBlogs(userBlogs.sort((a, b) => new Date(b.date) - new Date(a.date)));
        } catch (err) {
            console.error('Error fetching blogs:', err);
            setError('Failed to fetch blogs. Please try again later.');
        }
    };

    const handlePostBlog = async () => {
        if (newTitle.length < 5 || newTitle.length > 50 || newBody.length < 100 || newBody.length > 3000) {
            setError('Title must be 5-50 characters and body 100-3000 characters.');
            return;
        }
        try {
            const blogsRef = ref(db, 'blogs');
            const newBlogRef = push(blogsRef);
            await set(newBlogRef, {
                userId: user.uid,
                title: newTitle,
                body: newBody,
                author: user.displayName || 'Anonymous',
                date: new Date().toISOString(),
            });
            setNewTitle('');
            setNewBody('');
            setError('');
            fetchBlogs(user.uid);
        } catch (err) {
            console.error('Error posting blog:', err);
            setError('Failed to post the blog. Please try again later.');
        }
    };

    const handleDeleteBlog = async (id) => {
        if (window.confirm('Are you sure you want to delete this blog?')) {
            try {
                const blogRef = ref(db, `blogs/${id}`);
                await remove(blogRef);
                fetchBlogs(user.uid);
            } catch (err) {
                console.error('Error deleting blog:', err);
                setError('Failed to delete the blog. Please try again later.');
            }
        }
    };

    return (
        <div className="container">
            <h1>Welcome, {user?.displayName || 'User'}</h1>
            <hr />
            <h2>Post a New Blog</h2>
            <form onSubmit={(e) => { e.preventDefault(); handlePostBlog(); }}>
                <input
                    type="text"
                    placeholder="Blog Title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                />
                <textarea
                    placeholder="Blog Content"
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                    required
                ></textarea>
                <button type="submit">Post Blog</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <hr />
            <h2>Your Blogs</h2>
            {blogs.length > 0 ? (
                blogs.map(blog => (
                    <div key={blog.id} className="card">
                        <h3>{blog.title}</h3>
                        <p>{blog.body}</p>
                        <p>Published on: {new Date(blog.date).toLocaleDateString()}</p>
                        <button onClick={() => navigate(`/edit-blog/${blog.id}`)}>Edit</button>
                        <button onClick={() => handleDeleteBlog(blog.id)}>Delete</button>
                    </div>
                ))
            ) : (
                <p>No blogs posted yet.</p>
            )}
        </div>
    );
};

export default Dashboard;