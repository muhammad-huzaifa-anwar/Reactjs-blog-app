import React, { useEffect, useState } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import { Link } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { app } from '../firebase';

const HomePage = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);

    const auth = getAuth(app);
    const db = getDatabase(app);

    useEffect(() => {
        const fetchBlogsAndAuthors = async () => {
            try {
                setLoading(true);
                const blogsRef = ref(db, 'blogs');
                const usersRef = ref(db, 'users');
                const [blogsSnapshot, usersSnapshot] = await Promise.all([
                    get(blogsRef),
                    get(usersRef)
                ]);
                
                if (!blogsSnapshot.exists()) {
                    console.log('No blogs found');
                    setBlogs([]);
                    setLoading(false);
                    return;
                }

                const blogsData = blogsSnapshot.val();
                const usersData = usersSnapshot.val() || {};

                console.log('Blogs data:', blogsData);
                console.log('Users data:', usersData);

                const fetchedBlogs = Object.entries(blogsData).map(([key, value]) => {
                    const authorData = usersData[value.userId] || {};
                    console.log(`Blog ${key} author data:`, authorData);
                    return {
                        id: key,
                        ...value,
                        authorEmail: authorData.email || 'Email not available'
                    };
                });

                console.log('Fetched blogs:', fetchedBlogs);

                // Sort blogs by date
                const sortedBlogs = fetchedBlogs.sort((a, b) => 
                    new Date(b.date) - new Date(a.date)
                );

                setBlogs(sortedBlogs);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching blogs:', error);
                setError('Failed to load blogs. Please try again later.');
                setLoading(false);
            }
        };

        fetchBlogsAndAuthors();

        const unsubscribe = auth.onAuthStateChanged(currentUser => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, [auth, db]);

    if (loading) return <div className="text-center p-4">Loading...</div>;
    if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

    return (
        <div className="container">
          <h1 className="text-3xl font-bold mb-6 text-center text-red-500">
  Welcome to the Blog App!
</h1>

            <div className="mb-6">
                {user ? (
                    <div className="flex items-center justify-between">
                        <span>Welcome, {user.email}</span>
                        <button 
                            onClick={() => auth.signOut()}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <div className="text-center">
                        <Link to="/login" className="mr-4 text-blue-500 hover:underline">Login</Link>
                        <Link to="/signup" className="text-blue-500 hover:underline">Signup</Link>
                    </div>
                )}
            </div>

            <h2 className="text-2xl font-bold mb-4">All Blogs</h2>
            <div className="grid gap-6">
                {blogs.length === 0 ? (
                    <p className="text-center text-gray-500">No blogs available.</p>
                ) : (
                    blogs.map(blog => (
                        <div 
                            key={blog.id} 
                            className="card"
                        >
                            <h3 className="text-xl font-bold mb-2">{blog.title}</h3>
                            <p className="text-gray-600 mb-4">
                                {blog.body.slice(0, 200)}...
                            </p>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                <p className="text-sm text-gray-700 mb-2 sm:mb-0">
                                    {blog.author} - {blog.authorEmail} - {new Date(blog.date).toLocaleString()}
                                </p>
                                <Link 
                                    to={`/author/${blog.userId}`}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                                >
                                    View Author's Profile
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default HomePage;

