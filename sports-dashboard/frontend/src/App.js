import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/auth/AuthContext';

// Componentes de layout
import Layout from './components/layout/Layout';

// Páginas de autenticação
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/auth/Profile';

// Páginas do dashboard
import Dashboard from './pages/dashboard/Dashboard';
import TeamList from './pages/teams/TeamList';
import TeamDetail from './pages/teams/TeamDetail';
import PlayerList from './pages/players/PlayerList';
import PlayerDetail from './pages/players/PlayerDetail';
import MatchList from './pages/matches/MatchList';
import MatchDetail from './pages/matches/MatchDetail';
import TeamComparison from './pages/dashboard/TeamComparison';
import PlayerComparison from './pages/dashboard/PlayerComparison';
import LeagueTable from './pages/dashboard/LeagueTable';
import PerformanceTrends from './pages/dashboard/PerformanceTrends';

// Componente para rotas protegidas
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }
  
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Rotas protegidas */}
          <Route path="/" element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            
            {/* Rotas de equipas */}
            <Route path="teams" element={<TeamList />} />
            <Route path="teams/:id" element={<TeamDetail />} />
            
            {/* Rotas de jogadores */}
            <Route path="players" element={<PlayerList />} />
            <Route path="players/:id" element={<PlayerDetail />} />
            
            {/* Rotas de jogos */}
            <Route path="matches" element={<MatchList />} />
            <Route path="matches/:id" element={<MatchDetail />} />
            
            {/* Rotas analíticas */}
            <Route path="team-comparison" element={<TeamComparison />} />
            <Route path="player-comparison" element={<PlayerComparison />} />
            <Route path="league-table" element={<LeagueTable />} />
            <Route path="performance-trends" element={<PerformanceTrends />} />
          </Route>
          
          {/* Rota de fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
