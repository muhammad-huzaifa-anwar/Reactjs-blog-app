// File: src/components/NavBar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

const NavBar = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(setUser); // Listen to user auth state
        return () => unsubscribe(); // Cleanup subscription on unmount
    }, []);

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

    const handleLogout = () => {
        auth.signOut();
        navigate('/login');
    };

    return (
        <nav style={{ backgroundColor: '#6A1B9A', padding: '10px', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Blog App</h1>
                <div style={{ position: 'relative' }}>
                    {user ? (
                        <>
                            <button
                                onClick={toggleDropdown}
                                style={{ backgroundColor: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
                            >
                                <img
                                    src="https://via.placeholder.com/40"
                                    alt="User"
                                    style={{ borderRadius: '50%', marginRight: '10px' }}
                                />
                            </button>
                            {dropdownOpen && (
                                <ul
                                    style={{
                                        position: 'absolute',
                                        top: '100%',
                                        right: '0',
                                        backgroundColor: 'white',
                                        color: 'black',
                                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                        listStyle: 'none',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        zIndex: 100,
                                    }}
                                >
                                    <li>
                                        <Link to="/" onClick={toggleDropdown}>
                                            Home
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/dashboard" onClick={toggleDropdown}>
                                            Dashboard
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/profile" onClick={toggleDropdown}>
                                            Profile
                                        </Link>
                                    </li>
                                    <li>
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                toggleDropdown();
                                            }}
                                            style={{ backgroundColor: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}
                                        >
                                            Log Out
                                        </button>
                                    </li>
                                </ul>
                            )}
                        </>
                    ) : (
                        <Link to="/login" style={{ color: 'white' }}>
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
