import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Links de navegação
  const navLinks = [
    { to: '/', label: 'Dashboard', icon: 'chart-pie' },
    { to: '/teams', label: 'Equipas', icon: 'users' },
    { to: '/players', label: 'Jogadores', icon: 'user' },
    { to: '/matches', label: 'Jogos', icon: 'calendar' },
    { to: '/team-comparison', label: 'Comparar Equipas', icon: 'chart-bar' },
    { to: '/player-comparison', label: 'Comparar Jogadores', icon: 'chart-line' },
    { to: '/league-table', label: 'Tabela Classificativa', icon: 'table' },
    { to: '/performance-trends', label: 'Tendências', icon: 'trending-up' },
  ];

  return (
    <aside
      className={`bg-primary-800 text-white transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      } min-h-screen`}
    >
      {/* Botão para colapsar/expandir */}
      <div className="p-4 flex justify-end">
        <button
          onClick={toggleSidebar}
          className="text-white focus:outline-none"
          aria-label={isCollapsed ? 'Expandir menu' : 'Colapsar menu'}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isCollapsed ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              ></path>
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              ></path>
            )}
          </svg>
        </button>
      </div>

      {/* Logo */}
      <div className="p-4 flex items-center justify-center">
        <div className="text-xl font-bold">
          {isCollapsed ? 'DS' : 'Dashboard Desportivo'}
        </div>
      </div>

      {/* Links de navegação */}
      <nav className="mt-6">
        <ul>
          {navLinks.map((link) => (
            <li key={link.to} className="px-2 py-1">
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-700 text-white'
                      : 'text-primary-100 hover:bg-primary-700'
                  }`
                }
              >
                <span className="inline-flex items-center justify-center h-6 w-6">
                  <i className={`fas fa-${link.icon}`}></i>
                </span>
                {!isCollapsed && <span className="ml-3">{link.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
