import React, { useState, useEffect } from 'react';
import { analyticsService, teamService } from '../../services/api';
import { 
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer 
} from 'recharts';

const TeamComparison = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [teams, setTeams] = useState([]);
  const [selectedTeam1, setSelectedTeam1] = useState('');
  const [selectedTeam2, setSelectedTeam2] = useState('');
  const [comparisonData, setComparisonData] = useState(null);

  // Carregar lista de equipas
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await teamService.getTeams();
        setTeams(data.teams || []);
      } catch (err) {
        console.error('Erro ao carregar equipas:', err);
      }
    };

    fetchTeams();
  }, []);

  // Função para comparar equipas
  const compareTeams = async () => {
    if (!selectedTeam1 || !selectedTeam2) {
      setError('Por favor, selecione duas equipas para comparar.');
      return;
    }

    if (selectedTeam1 === selectedTeam2) {
      setError('Por favor, selecione equipas diferentes para comparar.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.compareTeams(selectedTeam1, selectedTeam2);
      setComparisonData(data);
    } catch (err) {
      setError('Erro ao comparar equipas: ' + (err.error || 'Erro desconhecido'));
      console.error('Erro ao comparar equipas:', err);
    } finally {
      setLoading(false);
    }
  };

  // Preparar dados para o gráfico de barras
  const prepareBarChartData = () => {
    if (!comparisonData) return [];

    return [
      {
        name: 'Vitórias',
        [comparisonData.team1.name]: comparisonData.team1.stats.wins,
        [comparisonData.team2.name]: comparisonData.team2.stats.wins,
      },
      {
        name: 'Empates',
        [comparisonData.team1.name]: comparisonData.team1.stats.draws,
        [comparisonData.team2.name]: comparisonData.team2.stats.draws,
      },
      {
        name: 'Derrotas',
        [comparisonData.team1.name]: comparisonData.team1.stats.losses,
        [comparisonData.team2.name]: comparisonData.team2.stats.losses,
      },
      {
        name: 'Golos Marcados',
        [comparisonData.team1.name]: comparisonData.team1.stats.goals_scored,
        [comparisonData.team2.name]: comparisonData.team2.stats.goals_scored,
      },
      {
        name: 'Golos Sofridos',
        [comparisonData.team1.name]: comparisonData.team1.stats.goals_conceded,
        [comparisonData.team2.name]: comparisonData.team2.stats.goals_conceded,
      },
    ];
  };

  // Preparar dados para o gráfico de radar
  const prepareRadarData = () => {
    if (!comparisonData) return [];

    return [
      {
        subject: 'Ataque',
        [comparisonData.team1.name]: comparisonData.team1.ratings.attack,
        [comparisonData.team2.name]: comparisonData.team2.ratings.attack,
        fullMark: 10,
      },
      {
        subject: 'Defesa',
        [comparisonData.team1.name]: comparisonData.team1.ratings.defense,
        [comparisonData.team2.name]: comparisonData.team2.ratings.defense,
        fullMark: 10,
      },
      {
        subject: 'Posse de Bola',
        [comparisonData.team1.name]: comparisonData.team1.ratings.possession,
        [comparisonData.team2.name]: comparisonData.team2.ratings.possession,
        fullMark: 10,
      },
      {
        subject: 'Físico',
        [comparisonData.team1.name]: comparisonData.team1.ratings.physical,
        [comparisonData.team2.name]: comparisonData.team2.ratings.physical,
        fullMark: 10,
      },
      {
        subject: 'Tática',
        [comparisonData.team1.name]: comparisonData.team1.ratings.tactical,
        [comparisonData.team2.name]: comparisonData.team2.ratings.tactical,
        fullMark: 10,
      },
    ];
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Comparação de Equipas</h1>
      
      {/* Seleção de equipas */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="team1" className="block text-sm font-medium text-gray-700 mb-1">
              Equipa 1
            </label>
            <select
              id="team1"
              value={selectedTeam1}
              onChange={(e) => setSelectedTeam1(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="">Selecione uma equipa</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="team2" className="block text-sm font-medium text-gray-700 mb-1">
              Equipa 2
            </label>
            <select
              id="team2"
              value={selectedTeam2}
              onChange={(e) => setSelectedTeam2(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="">Selecione uma equipa</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-4">
          <button
            onClick={compareTeams}
            disabled={loading}
            className={`w-full md:w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'A comparar...' : 'Comparar Equipas'}
          </button>
        </div>
        
        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
      </div>
      
      {/* Resultados da comparação */}
      {comparisonData && (
        <div className="space-y-6">
          {/* Cabeçalho da comparação */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
              <div className="flex flex-col items-center">
                {comparisonData.team1.logo_url && (
                  <img 
                    src={comparisonData.team1.logo_url} 
                    alt={`${comparisonData.team1.name} logo`} 
                    className="w-16 h-16 object-contain mb-2"
                  />
                )}
                <h2 className="text-xl font-bold text-gray-800">{comparisonData.team1.name}</h2>
              </div>
              
              <div className="text-2xl font-bold text-gray-500">VS</div>
              
              <div className="flex flex-col items-center">
                {comparisonData.team2.logo_url && (
                  <img 
                    src={comparisonData.team2.logo_url} 
                    alt={`${comparisonData.team2.name} logo`} 
                    className="w-16 h-16 object-contain mb-2"
                  />
                )}
                <h2 className="text-xl font-bold text-gray-800">{comparisonData.team2.name}</h2>
              </div>
            </div>
          </div>
          
          {/* Gráficos de comparação */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de barras para estatísticas */}
            <div className="bg-white rounded-lg shadow-card p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Estatísticas Comparativas</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={prepareBarChartData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey={comparisonData.team1.name} fill="#8884d8" />
                    <Bar dataKey={comparisonData.team2.name} fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Gráfico de radar para ratings */}
            <div className="bg-white rounded-lg shadow-card p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Ratings Comparativos</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={prepareRadarData()}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} />
                    <Radar
                      name={comparisonData.team1.name}
                      dataKey={comparisonData.team1.name}
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                    <Radar
                      name={comparisonData.team2.name}
                      dataKey={comparisonData.team2.name}
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.6}
                    />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Confrontos diretos */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Confrontos Diretos</h3>
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
                      Resultado
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vencedor
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(comparisonData.head_to_head || []).map((match) => (
                    <tr key={match.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(match.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {match.competition}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {`${comparisonData.team1.name} ${match.team1_score} - ${match.team2_score} ${comparisonData.team2.name}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {match.team1_score > match.team2_score ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {comparisonData.team1.name}
                          </span>
                        ) : match.team1_score < match.team2_score ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {comparisonData.team2.name}
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Empate
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {(comparisonData.head_to_head || []).length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                        Nenhum confronto direto encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Resumo da comparação */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Resumo da Comparação</h3>
            <div className="prose max-w-none">
              <p>{comparisonData.summary}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamComparison;
