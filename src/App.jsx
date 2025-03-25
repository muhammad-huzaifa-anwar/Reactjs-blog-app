import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NavBar from './component/NavBar';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import Login from './component/Auth/Login';
import Signup from './component/Auth/Signup';
import AuthorPage from './pages/AuthorPage';
import Profile from './component/Profile';
import NotFound from './pages/NotFound';
import EditBlog from './pages/EditBlog'; // Import the new component
import ProfilePage from './pages/ProfilePage'; // Import the new component

const App = () => {
    return (
        <Router>
            <NavBar />
            <ToastContainer />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<ProfilePage />} /> {/* Add this route */}
                <Route path="/author/:id" element={<AuthorPage />} />
                <Route path="/edit-blog/:id" element={<EditBlog />} /> {/* Add this route */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
};

export default App;