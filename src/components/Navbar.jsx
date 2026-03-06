import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const [active, setActive] = useState(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const base =
    "flex items-center gap-2 py-1 rounded-2xl transition-colors";

  const activeClass =
    `${base} bg-gray-200 px-6`;

  const inactiveClass =
    `${base} bg-white w-auto hover:bg-gray-100 px-6`;

  const items = [
    { label: "Upload Data", icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="18" height="18"><path d="M342.6 73.4C330.1 60.9 309.8 60.9 297.3 73.4L169.3 201.4C156.8 213.9 156.8 234.2 169.3 246.7C181.8 259.2 202.1 259.2 214.6 246.7L288 173.3L288 384C288 401.7 302.3 416 320 416C337.7 416 352 401.7 352 384L352 173.3L425.4 246.7C437.9 259.2 458.2 259.2 470.7 246.7C483.2 234.2 483.2 213.9 470.7 201.4L342.7 73.4zM160 416C160 398.3 145.7 384 128 384C110.3 384 96 398.3 96 416L96 480C96 533 139 576 192 576L448 576C501 576 544 533 544 480L544 416C544 398.3 529.7 384 512 384C494.3 384 480 398.3 480 416L480 480C480 497.7 465.7 512 448 512L192 512C174.3 512 160 497.7 160 480L160 416z" /></svg>),
      path: ""
     },

    { label: "Preview Send", icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="18" height="18"><path d="M457.5 71C450.6 64.1 440.3 62.1 431.3 65.8C422.3 69.5 416.5 78.3 416.5 88L416.5 144L368.5 144C280.1 144 208.5 215.6 208.5 304C208.5 350.7 229.2 384.4 252.1 407.4C260.2 415.6 268.6 422.3 276.4 427.8C285.6 434.3 298.1 433.5 306.5 425.9C314.9 418.3 316.7 405.9 311 396.1C307.4 389.8 304.5 381.2 304.5 369.4C304.5 333.2 333.8 303.9 370 303.9L416.5 303.9L416.5 359.9C416.5 369.6 422.3 378.4 431.3 382.1C440.3 385.8 450.6 383.8 457.5 376.9L593.5 240.9C602.9 231.5 602.9 216.3 593.5 207L457.5 71zM464.5 168L464.5 145.9L542.6 224L464.5 302.1L464.5 280C464.5 266.7 453.8 256 440.5 256L370 256C319.1 256 276.1 289.5 261.7 335.6C258.4 326.2 256.5 315.8 256.5 304C256.5 242.1 306.6 192 368.5 192L440.5 192C453.8 192 464.5 181.3 464.5 168zM144.5 160C100.3 160 64.5 195.8 64.5 240L64.5 496C64.5 540.2 100.3 576 144.5 576L400.5 576C444.7 576 480.5 540.2 480.5 496L480.5 472C480.5 458.7 469.8 448 456.5 448C443.2 448 432.5 458.7 432.5 472L432.5 496C432.5 513.7 418.2 528 400.5 528L144.5 528C126.8 528 112.5 513.7 112.5 496L112.5 240C112.5 222.3 126.8 208 144.5 208L168.5 208C181.8 208 192.5 197.3 192.5 184C192.5 170.7 181.8 160 168.5 160L144.5 160z" /></svg>),
      path: "/previewsend"
     },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="bg-white py-2 rounded-2xl shadow-md w-auto m-5 px-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <ul className="flex items-center space-x-4">
          {items.map((item, index) => (
            <Link key={index} to={`/${item.label.toLowerCase().replace(/\s+/g, '')}`}>
              <li>
                <button
                  onClick={() => setActive(index)}
                  className={active === index ? activeClass : inactiveClass}
                >
                  {item.icon}
                  <span className="hidden sm:inline whitespace-nowrap">
                    {item.label}
                  </span>
                </button>
              </li>
            </Link>
          ))}
        </ul>

        {user && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm text-gray-700 hidden sm:inline">
                {user.displayName}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
