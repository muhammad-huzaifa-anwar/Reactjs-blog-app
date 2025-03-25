import React, { useEffect, useState } from 'react';
import { getDatabase, ref, query, orderByChild, equalTo, get } from 'firebase/database';
import { getAuth, updatePassword } from 'firebase/auth';
import { app } from '../firebase';

const ProfilePage = () => {
    const [blogs, setBlogs] = useState([]);
    const [user, setUser] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const db = getDatabase(app);
    const auth = getAuth(app);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);

                const blogsRef = ref(db, 'blogs');
                const q = query(blogsRef, orderByChild('authorId'), equalTo(currentUser.uid));
                const snapshot = await get(q);

                if (snapshot.exists()) {
                    const blogsList = [];
                    snapshot.forEach(childSnapshot => {
                        blogsList.push({
                            id: childSnapshot.key,
                            ...childSnapshot.val(),
                        });
                    });
                    setBlogs(blogsList);
                }
            }
        });

        return () => unsubscribe();
    }, [auth, db]);

    const handlePasswordChange = async () => {
        if (newPassword) {
            try {
                await updatePassword(user, newPassword);
                setMessage('Password updated successfully.');
            } catch (error) {
                setMessage('Error updating password: ' + error.message);
            }
        }
    };

    return (
        <div>
            <h1>Profile Page</h1>
            {user && (
                <div>
                    <h2>Welcome, {user.email}</h2>
                    <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button onClick={handlePasswordChange}>Update Password</button>
                    <p>{message}</p>
                </div>
            )}
            <h2>Your Blogs</h2>
            <div>
                {blogs.map(blog => (
                    <div key={blog.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
                        <h3>{blog.title}</h3>
                        <p>{blog.body}</p>
                        <p>Published: {new Date(blog.date).toLocaleString()}</p>
                        {user && user.photoURL && (
                            <img src={user.photoURL} alt="Profile" style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProfilePage;