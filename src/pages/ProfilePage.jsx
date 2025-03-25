import React, { useEffect, useState } from 'react';
import { getDatabase, ref, query, orderByChild, equalTo, get } from 'firebase/database';
import { getAuth, updatePassword } from 'firebase/auth'; // Add this import
import { app } from '../firebase';

const ProfilePage = () => {
    const [blogs, setBlogs] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const db = getDatabase(app);
    const auth = getAuth(app);

    useEffect(() => {
        const fetchUserAndBlogs = async () => {
            try {
                setLoading(true);
                setError(null);

                const currentUser = auth.currentUser;

                if (!currentUser) {
                    setError('No user is logged in.');
                    setLoading(false);
                    return;
                }

                // Fetch user details
                const userRef = ref(db, 'users/' + currentUser.uid);
                const userSnap = await get(userRef);

                if (userSnap.exists()) {
                    const userData = userSnap.val();
                    setUser(userData);
                } else {
                    setUser(null);
                }

                // Fetch blogs by the logged-in user
                const blogsRef = ref(db, 'blogs');
                const q = query(blogsRef, orderByChild('userId'), equalTo(currentUser.uid));
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
                console.error('Error fetching user or blogs:', error);
                setError('Failed to fetch user or blogs. Please try again later.');
                setLoading(false);
            }
        };

        fetchUserAndBlogs();
    }, [auth, db]);

    const handleChangePassword = async () => {
        const newPassword = prompt('Enter your new password:');
        if (newPassword) {
            try {
                await updatePassword(auth.currentUser, newPassword);
                alert('Password updated successfully!');
            } catch (error) {
                console.error('Error updating password:', error);
                alert('Failed to update password. Please try again.');
            }
        }
    };

    return (
        <div className="container">
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p>{error}</p>
            ) : user ? (
                <div>
                    <h1>{user.name}'s Profile</h1>
                    <p>Email: {user.email}</p>
                    {user && (
                        <button onClick={handleChangePassword}>
                            Change Password
                        </button>
                    )}
                    <p>Bio: {user.bio || 'No bio available.'}</p>
                </div>
            ) : (
                <p>User not found</p>
            )}
            <div>
                <h2>Your Blogs</h2>
                {blogs.length > 0 ? (
                    blogs.map(blog => (
                        <div key={blog.id} className="card">
                            <h3>{blog.title}</h3>
                            <p>{blog.body}</p>
                            <p>Published: {new Date(blog.date).toLocaleString()}</p>
                        </div>
                    ))
                ) : (
                    <p>No blogs posted yet.</p>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
