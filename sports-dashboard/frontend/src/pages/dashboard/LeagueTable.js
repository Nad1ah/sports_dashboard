import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/api';

const LeagueTable = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [filters, setFilters] = useState({
    league: 'premier_league',
    season: '2024-2025',
  });

  // Opções de ligas
  const leagueOptions = [
    { value: 'premier_league', label: 'Premier League' },
    { value: 'la_liga', label: 'La Liga' },
    { value: 'bundesliga', label: 'Bundesliga' },
    { value: 'serie_a', label: 'Serie A' },
    { value: 'ligue_1', label: 'Ligue 1' },
    { value: 'primeira_liga', label: 'Primeira Liga' },
  ];

  // Opções de temporadas
  const seasonOptions = [
    { value: '2024-2025', label: '2024-2025' },
    { value: '2023-2024', label: '2023-2024' },
    { value: '2022-2023', label: '2022-2023' },
  ];

  // Função para buscar dados da tabela
  const fetchTableData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getLeagueTable(filters.league, filters.season);
      setTableData(data);
    } catch (err) {
      setError('Erro ao carregar tabela classificativa: ' + (err.error || 'Erro desconhecido'));
      console.error('Erro ao carregar tabela classificativa:', err);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    fetchTableData();
  }, []);

  // Atualizar dados quando os filtros mudarem
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    fetchTableData();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Tabela Classificativa</h1>
      
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="league" className="block text-sm font-medium text-gray-700 mb-1">
              Liga
            </label>
            <select
              id="league"
              name="league"
              value={filters.league}
              onChange={handleFilterChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              {leagueOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="season" className="block text-sm font-medium text-gray-700 mb-1">
              Temporada
            </label>
            <select
              id="season"
              name="season"
              value={filters.season}
              onChange={handleFilterChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              {seasonOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleApplyFilters}
              disabled={loading}
              className={`w-full md:w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'A carregar...' : 'Aplicar Filtros'}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
      </div>
      
      {/* Tabela classificativa */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          {tableData?.league_name || leagueOptions.find(o => o.value === filters.league)?.label} - {filters.season}
        </h3>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-primary-600 text-xl">A carregar tabela classificativa...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pos
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Equipa
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    J
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    V
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    E
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    D
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GM
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GS
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DG
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pts
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Forma
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(tableData?.standings || []).map((team, index) => (
                  <tr key={team.team_id} className={`hover:bg-gray-50 ${
                    index < 4 ? 'bg-green-50' : 
                    index >= (tableData?.standings?.length || 0) - 3 ? 'bg-red-50' : ''
                  }`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {team.logo_url && (
                          <img 
                            src={team.logo_url} 
                            alt={`${team.team_name} logo`} 
                            className="w-6 h-6 mr-2"
                          />
                        )}
                        <span className="text-sm font-medium text-gray-900">{team.team_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {team.matches_played}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {team.wins}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {team.draws}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {team.losses}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {team.goals_for}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {team.goals_against}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {team.goal_difference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {team.points}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-1">
                        {(team.form || []).map((result, idx) => (
                          <div 
                            key={idx}
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                              result === 'W' ? 'bg-success' : 
                              result === 'D' ? 'bg-warning' : 
                              'bg-danger'
                            }`}
                          >
                            {result}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                {!tableData?.standings?.length && !loading && (
                  <tr>
                    <td colSpan="11" className="px-6 py-4 text-center text-sm text-gray-500">
                      Nenhum dado disponível
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Legenda */}
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-50 mr-2"></div>
            <span className="text-sm text-gray-600">Qualificação para competições europeias</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-50 mr-2"></div>
            <span className="text-sm text-gray-600">Zona de despromoção</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeagueTable;
