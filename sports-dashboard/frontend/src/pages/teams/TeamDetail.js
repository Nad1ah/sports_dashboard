import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { teamService } from '../../services/api';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell 
} from 'recharts';

const TeamDetail = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [team, setTeam] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        
        // Carregar dados da equipa
        const teamData = await teamService.getTeam(id);
        setTeam(teamData.team);
        
        // Carregar estatísticas da equipa
        const statsData = await teamService.getTeamStatistics(id);
        setStatistics(statsData);
        
        // Carregar jogadores da equipa
        const playersData = await teamService.getTeamPlayers(id);
        setPlayers(playersData.players);
        
        // Carregar jogos da equipa
        const matchesData = await teamService.getTeamMatches(id);
        setMatches(matchesData.matches);
        
        setError(null);
      } catch (err) {
        setError('Erro ao carregar dados da equipa: ' + (err.error || 'Erro desconhecido'));
        console.error('Erro ao carregar dados da equipa:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTeamData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-primary-600 text-xl">A carregar dados da equipa...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Erro!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Aviso!</strong>
        <span className="block sm:inline"> Equipa não encontrada.</span>
      </div>
    );
  }

  // Cores para gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  // Dados para o gráfico de resultados
  const resultsData = [
    { name: 'Vitórias', value: statistics?.wins || 0 },
    { name: 'Empates', value: statistics?.draws || 0 },
    { name: 'Derrotas', value: statistics?.losses || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Cabeçalho da equipa */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="flex flex-col md:flex-row items-center md:items-start">
          {team.logo_url && (
            <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 mb-4 md:mb-0 md:mr-6">
              <img 
                src={team.logo_url} 
                alt={`${team.name} logo`} 
                className="w-full h-full object-contain"
              />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{team.name}</h1>
            <div className="mt-2 text-gray-600">
              <p><span className="font-semibold">País:</span> {team.country}</p>
              <p><span className="font-semibold">Liga:</span> {team.league}</p>
              {team.founded_year && (
                <p><span className="font-semibold">Fundação:</span> {team.founded_year}</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Estatísticas da equipa */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-card p-6">
          <h3 className="text-lg font-semibold text-gray-700">Jogos</h3>
          <p className="text-3xl font-bold text-primary-600 mt-2">
            {statistics?.total_matches || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-card p-6">
          <h3 className="text-lg font-semibold text-gray-700">Vitórias</h3>
          <p className="text-3xl font-bold text-success mt-2">
            {statistics?.wins || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-card p-6">
          <h3 className="text-lg font-semibold text-gray-700">Golos Marcados</h3>
          <p className="text-3xl font-bold text-info mt-2">
            {statistics?.goals_scored || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-card p-6">
          <h3 className="text-lg font-semibold text-gray-700">Golos Sofridos</h3>
          <p className="text-3xl font-bold text-danger mt-2">
            {statistics?.goals_conceded || 0}
          </p>
        </div>
      </div>
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de resultados */}
        <div className="bg-white rounded-lg shadow-card p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Resultados</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={resultsData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {resultsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Forma recente */}
        <div className="bg-white rounded-lg shadow-card p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Forma Recente</h3>
          <div className="flex items-center justify-center h-80">
            <div className="flex space-x-2">
              {(statistics?.form || []).map((result, index) => (
                <div 
                  key={index}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                    result === 'W' ? 'bg-success' : 
                    result === 'D' ? 'bg-warning' : 
                    'bg-danger'
                  }`}
                >
                  {result}
                </div>
              ))}
              {statistics?.form?.length === 0 && (
                <p className="text-gray-500">Sem dados de forma recente</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Jogadores da equipa */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Jogadores</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posição
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nacionalidade
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Número
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {players.map((player) => (
                <tr key={player.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {player.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {player.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {player.nationality}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {player.jersey_number || '-'}
                  </td>
                </tr>
              ))}
              {players.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                    Nenhum jogador encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Jogos recentes */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Jogos Recentes</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Competição
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adversário
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resultado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {matches.slice(0, 5).map((match) => {
                const isHome = match.home_team_id === parseInt(id);
                const opponentId = isHome ? match.away_team_id : match.home_team_id;
                const result = isHome 
                  ? `${match.home_score} - ${match.away_score}` 
                  : `${match.away_score} - ${match.home_score}`;
                
                return (
                  <tr key={match.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(match.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {match.competition}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {opponentId} {isHome ? '(Casa)' : '(Fora)'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        match.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        match.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {match.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {matches.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    Nenhum jogo encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeamDetail;
