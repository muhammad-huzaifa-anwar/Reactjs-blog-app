// File: src/components/NavBar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

const NavBar = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(setUser);
        return () => unsubscribe();
    }, []);

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

    const handleLogout = () => {
        auth.signOut();
        navigate('/login');
    };

    return (
        <nav className="bg-blue-600 text-white shadow-md">
            <div className="container mx-auto flex justify-between items-center py-4 px-6">
                <h1 className="text-2xl font-bold">
                    <span className="text-white">
                        Blog App
                    </span>
                </h1>
                <div className="relative">
                    {user ? (
                        <>
                            <button
                                onClick={toggleDropdown}
                                className="flex items-center focus:outline-none"
                            >
                                <img
                                    src="https://via.placeholder.com/40"
                                    alt="User"
                                    className="w-10 h-10 rounded-full border-2 border-white"
                                />
                                <span className="ml-2 hidden sm:inline-block">{user.email}</span>
                            </button>
                            {dropdownOpen && (
                                <ul className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg">
                                    <li className="border-b">
                                        <Link
                                            to="/"
                                            onClick={toggleDropdown}
                                            className="block px-4 py-2 hover:bg-gray-100"
                                        >
                                            Home
                                        </Link>
                                    </li>
                                    <li className="border-b">
                                        <Link
                                            to="/dashboard"
                                            onClick={toggleDropdown}
                                            className="block px-4 py-2 hover:bg-gray-100"
                                        >
                                            Dashboard
                                        </Link>
                                    </li>
                                    <li className="border-b">
                                        <Link
                                            to="/profile"
                                            onClick={toggleDropdown}
                                            className="block px-4 py-2 hover:bg-gray-100"
                                        >
                                            Profile
                                        </Link>
                                    </li>
                                    <li>
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                toggleDropdown();
                                            }}
                                            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                        >
                                            Log Out
                                        </button>
                                    </li>
                                </ul>
                            )}
                        </>
                    ) : (
                        <Link
                            to="/login"
                            className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
