import axios from 'axios';

// Configuração base do axios
const API_URL = 'http://localhost:5000/api';

// Criar instância do axios com configuração base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Serviços de autenticação
export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'Erro de conexão' };
    }
  },

  register: async (username, email, password) => {
    try {
      const response = await api.post('/auth/register', { username, email, password });
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'Erro de conexão' };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  getProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'Erro de conexão' };
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await api.patch('/auth/me', userData);
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'Erro de conexão' };
    }
  },
};

// Serviços de equipas
export const teamService = {
  getTeams: async () => {
    try {
      const response = await api.get('/teams');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'Erro de conexão' };
    }
  },

  getTeam: async (id) => {
    try {
      const response = await api.get(`/teams/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'Erro de conexão' };
    }
  },

  getTeamPlayers: async (id) => {
    try {
      const response = await api.get(`/teams/${id}/players`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'Erro de conexão' };
    }
  },

  getTeamMatches: async (id) => {
    try {
      const response = await api.get(`/teams/${id}/matches`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'Erro de conexão' };
    }
  },

  getTeamStatistics: async (id) => {
    try {
      const response = await api.get(`/teams/${id}/statistics`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'Erro de conexão' };
    }
  },
};

// Serviços de jogadores
export const playerService = {
  getPlayers: async (filters = {}) => {
    try {
      const response = await api.get('/players', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'Erro de conexão' };
    }
  },

  getPlayer: async (id) => {
    try {
      const response = await api.get(`/players/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'Erro de conexão' };
    }
  },

  getPlayerStatistics: async (id) => {
    try {
      const response = await api.get(`/players/${id}/statistics`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'Erro de conexão' };
    }
  },

  getPlayerPerformance: async (id) => {
    try {
      const response = await api.get(`/players/${id}/performance`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'Erro de conexão' };
    }
  },
};

// Serviços de jogos
export const matchService = {
  getMatches: async (filters = {}) => {
    try {
      const response = await api.get('/matches', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'Erro de conexão' };
    }
  },

  getMatch: async (id) => {
    try {
      const response = await api.get(`/matches/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'Erro de conexão' };
    }
  },

  getMatchStatistics: async (id) => {
    try {
      const response = await api.get(`/matches/${id}/statistics`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'Erro de conexão' };
    }
  },

  getMatchTimeline: async (id) => {
    try {
      const response = await api.get(`/matches/${id}/timeline`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'Erro de conexão' };
    }
  },
};

// Serviços analíticos
export const analyticsService = {
  getDashboardData: async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'Erro de conexão' };
    }
  },

  compareTeams: async (team1Id, team2Id) => {
    try {
      const response = await api.get('/analytics/team-comparison', {
        params: { team1_id: team1Id, team2_id: team2Id },
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'Erro de conexão' };
    }
  },

  comparePlayers: async (player1Id, player2Id) => {
    try {
      const response = await api.get('/analytics/player-comparison', {
        params: { player1_id: player1Id, player2_id: player2Id },
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'Erro de conexão' };
    }
  },

  getLeagueTable: async (league, season) => {
    try {
      const response = await api.get('/analytics/league-table', {
        params: { league, season },
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'Erro de conexão' };
    }
  },

  getPerformanceTrends: async (params) => {
    try {
      const response = await api.get('/analytics/performance-trends', {
        params,
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'Erro de conexão' };
    }
  },
};

export default api;
