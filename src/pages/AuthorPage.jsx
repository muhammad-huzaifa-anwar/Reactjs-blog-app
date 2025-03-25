import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDatabase, ref, query, orderByChild, equalTo, get } from 'firebase/database';
import { app } from '../firebase';
import { getAuth } from 'firebase/auth'; // Import Firebase Auth

const AuthorPage = () => {
    const { id } = useParams(); // Get the author ID from the URL parameters
    const [blogs, setBlogs] = useState([]);
    const [author, setAuthor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const db = getDatabase(app);
    const auth = getAuth(app); // Initialize Firebase Auth
    const currentUser = auth.currentUser; // Get the currently logged-in user

    useEffect(() => {
        const fetchAuthorAndBlogs = async () => {
            try {
                setLoading(true);
                setError(null);

                // Determine if the logged-in user is viewing their own profile
                const authorId = id || (currentUser ? currentUser.uid : null);

                if (!authorId) {
                    setError('No author ID provided.');
                    setLoading(false);
                    return;
                }

                // Fetch author details
                const authorRef = ref(db, 'users/' + authorId);
                const authorSnap = await get(authorRef);

                if (authorSnap.exists()) {
                    const authorData = authorSnap.val();
                    console.log('Author found:', authorData); // Log author data if found
                    setAuthor(authorData);
                } else {
                    console.log('No such author!');
                    setAuthor(null);
                }

                // Fetch blogs by this author
                const blogsRef = ref(db, 'blogs');
                const q = query(blogsRef, orderByChild('userId'), equalTo(authorId));
                const blogsSnap = await get(q);

                if (blogsSnap.exists()) {
                    const blogsList = [];
                    blogsSnap.forEach(childSnapshot => {
                        blogsList.push({
                            id: childSnapshot.key,
                            ...childSnapshot.val(),
                        });
                    });
                    setBlogs(blogsList.sort((a, b) => new Date(b.date) - new Date(a.date))); // Sort by latest first
                } else {
                    setBlogs([]); // If no blogs found, set empty array
                }

                setLoading(false);
            } catch (error) {
                console.error('Error fetching author or blogs:', error);
                setError('Failed to fetch author or blogs. Please try again later.');
                setLoading(false);
            }
        };

        fetchAuthorAndBlogs();
    }, [id, db, currentUser]);

    return (
        <div className="container">
            {loading ? (
                <p className="text-center">Loading...</p>
            ) : error ? (
                <p className="text-center text-red-500">{error}</p>
            ) : author ? (
                <div>
                    <h1 className="text-3xl font-bold mb-4">{author.name}'s Author Page</h1>
                    <p>Email: {author.email}</p>
                    <p>Bio: {author.bio || 'No bio available.'}</p>
                </div>
            ) : (
                <p className="text-center">Author not found</p>
            )}
            <div>
                <h2 className="text-2xl font-bold mb-4">Blogs by {author ? author.name : 'Author'}</h2>
                {blogs.length > 0 ? (
                    blogs.map(blog => (
                        <div key={blog.id} className="card">
                            <h3 className="text-xl font-bold">{blog.title}</h3>
                            <p>{blog.body}</p>
                            <p>Published: {new Date(blog.date).toLocaleString()}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500">No blogs posted yet.</p>
                )}
            </div>
        </div>
    );
};

export default AuthorPage;