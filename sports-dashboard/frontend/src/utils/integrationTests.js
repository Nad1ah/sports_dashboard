// Arquivo de testes de integração para validar a comunicação entre frontend e backend

import api from './chartUtils';

// Função para testar a conexão com a API
export const testApiConnection = async () => {
  try {
    // Testar endpoint de saúde da API
    const response = await api.get('/health');
    return {
      success: true,
      status: response.status,
      message: 'Conexão com a API estabelecida com sucesso'
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status || 'Desconhecido',
      message: 'Falha na conexão com a API',
      error: error.message
    };
  }
};

// Função para testar autenticação
export const testAuthentication = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return {
      success: true,
      token: response.data.access_token,
      user: response.data.user,
      message: 'Autenticação realizada com sucesso'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Falha na autenticação',
      error: error.response?.data?.error || error.message
    };
  }
};

// Função para testar carregamento de dados do dashboard
export const testDashboardData = async () => {
  try {
    const response = await api.get('/analytics/dashboard');
    return {
      success: true,
      data: response.data,
      message: 'Dados do dashboard carregados com sucesso'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Falha ao carregar dados do dashboard',
      error: error.response?.data?.error || error.message
    };
  }
};

// Função para testar carregamento de dados de equipa
export const testTeamData = async (teamId) => {
  try {
    const teamResponse = await api.get(`/teams/${teamId}`);
    const statsResponse = await api.get(`/teams/${teamId}/statistics`);
    const playersResponse = await api.get(`/teams/${teamId}/players`);
    
    return {
      success: true,
      team: teamResponse.data.team,
      statistics: statsResponse.data,
      players: playersResponse.data.players,
      message: 'Dados da equipa carregados com sucesso'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Falha ao carregar dados da equipa',
      error: error.response?.data?.error || error.message
    };
  }
};

// Função para testar carregamento de dados de jogador
export const testPlayerData = async (playerId) => {
  try {
    const playerResponse = await api.get(`/players/${playerId}`);
    const statsResponse = await api.get(`/players/${playerId}/statistics`);
    const performanceResponse = await api.get(`/players/${playerId}/performance`);
    
    return {
      success: true,
      player: playerResponse.data.player,
      statistics: statsResponse.data,
      performance: performanceResponse.data,
      message: 'Dados do jogador carregados com sucesso'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Falha ao carregar dados do jogador',
      error: error.response?.data?.error || error.message
    };
  }
};

// Função para testar comparação de equipas
export const testTeamComparison = async (team1Id, team2Id) => {
  try {
    const response = await api.get('/analytics/team-comparison', {
      params: { team1_id: team1Id, team2_id: team2Id }
    });
    
    return {
      success: true,
      data: response.data,
      message: 'Comparação de equipas realizada com sucesso'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Falha ao comparar equipas',
      error: error.response?.data?.error || error.message
    };
  }
};

// Função para testar carregamento da tabela classificativa
export const testLeagueTable = async (league, season) => {
  try {
    const response = await api.get('/analytics/league-table', {
      params: { league, season }
    });
    
    return {
      success: true,
      data: response.data,
      message: 'Tabela classificativa carregada com sucesso'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Falha ao carregar tabela classificativa',
      error: error.response?.data?.error || error.message
    };
  }
};

// Função para executar todos os testes de integração
export const runAllIntegrationTests = async () => {
  const results = {
    apiConnection: await testApiConnection(),
    authentication: await testAuthentication({ email: 'test@example.com', password: 'password' }),
    dashboardData: null,
    teamData: null,
    playerData: null,
    teamComparison: null,
    leagueTable: null
  };
  
  // Só continuar os testes se a autenticação for bem-sucedida
  if (results.authentication.success) {
    results.dashboardData = await testDashboardData();
    results.teamData = await testTeamData(1); // ID de equipa de exemplo
    results.playerData = await testPlayerData(1); // ID de jogador de exemplo
    results.teamComparison = await testTeamComparison(1, 2); // IDs de equipas de exemplo
    results.leagueTable = await testLeagueTable('premier_league', '2024-2025');
  }
  
  // Calcular resultado geral
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(result => result && result.success).length;
  
  return {
    results,
    summary: {
      total: totalTests,
      passed: passedTests,
      failed: totalTests - passedTests,
      success_rate: (passedTests / totalTests) * 100
    }
  };
};

export default {
  testApiConnection,
  testAuthentication,
  testDashboardData,
  testTeamData,
  testPlayerData,
  testTeamComparison,
  testLeagueTable,
  runAllIntegrationTests
};
