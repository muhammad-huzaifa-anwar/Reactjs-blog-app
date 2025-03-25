import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDatabase, ref, get, update } from 'firebase/database';

const EditBlog = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const db = getDatabase();

    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const blogRef = ref(db, `blogs/${id}`);
                const snapshot = await get(blogRef);
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    setTitle(data.title);
                    setBody(data.body);
                } else {
                    setError('Blog not found.');
                }
            } catch (err) {
                console.error('Error fetching blog:', err);
                setError('Failed to fetch blog. Please try again later.');
            }
        };

        fetchBlog();
    }, [db, id]);

    const handleUpdateBlog = async () => {
        if (title.length < 5 || title.length > 50 || body.length < 100 || body.length > 3000) {
            setError('Title must be 5-50 characters and body 100-3000 characters.');
            return;
        }
        try {
            const blogRef = ref(db, `blogs/${id}`);
            await update(blogRef, { title, body });
            navigate('/dashboard'); // Redirect to the dashboard after updating
        } catch (err) {
            console.error('Error updating blog:', err);
            setError('Failed to update the blog. Please try again later.');
        }
    };

    if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

    return (
        <div className="container">
            <h1 className="text-2xl font-bold mb-4">Edit Blog</h1>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateBlog();
                }}
            >
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter blog title"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Body</label>
                    <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Enter blog content"
                        required
                    ></textarea>
                </div>
                <button type="submit">Update Blog</button>
            </form>
        </div>
    );
};

export default EditBlog;
