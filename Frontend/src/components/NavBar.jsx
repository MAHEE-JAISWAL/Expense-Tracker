import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false); // <- new
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("token"));
    const onStorage = () => setLoggedIn(!!localStorage.getItem("token"));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setLoggedIn(false);
    setShowDropdown(false);
    setMobileOpen(false);
    navigate("/");
  };

  const handleNavigate = (path) => {
    setMobileOpen(false);
    navigate(path);
  };

  return (
    <header className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="text-2xl font-bold text-indigo-600 hover:text-indigo-700"
        >
          SmartExpense
        </button>

        {/* Desktop links */}
        <ul className="hidden md:flex space-x-6 font-medium text-gray-700">
          <li>
            <button
              onClick={() => navigate("/")}
              className="hover:text-indigo-600"
            >
              Home
            </button>
          </li>
          <li>
            <button
              onClick={() => navigate("/dashboard")}
              className="hover:text-indigo-600"
            >
              Expenses
            </button>
          </li>
        </ul>

        {/* Desktop auth/buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {!loggedIn ? (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-indigo-600 border border-indigo-600 px-4 py-1.5 rounded hover:bg-indigo-50"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="bg-indigo-600 text-white px-4 py-1.5 rounded hover:bg-indigo-700"
              >
                Sign Up
              </button>
            </>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown((v) => !v)}
                className="ml-2 focus:outline-none"
              >
                <svg
                  className="w-8 h-8 text-indigo-600 rounded-full border border-indigo-200 bg-indigo-50 p-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 20c0-2.21 3.582-4 8-4s8 1.79 8 4"
                  />
                </svg>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-10">
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate("/profile");
                    }}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate("/dashboard");
                    }}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Expenses
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 border-t"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              {mobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <div className="px-4 py-3 space-y-2">
            <button
              onClick={() => handleNavigate("/")}
              className="w-full text-left px-3 py-2 rounded hover:bg-gray-100"
            >
              Home
            </button>
            <button
              onClick={() => handleNavigate("/dashboard")}
              className="w-full text-left px-3 py-2 rounded hover:bg-gray-100"
            >
              Expenses
            </button>
            {loggedIn ? (
              <>
                <button
                  onClick={() => handleNavigate("/profile")}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100"
                >
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavigate("/login")}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100"
                >
                  Login
                </button>
                <button
                  onClick={() => handleNavigate("/register")}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
