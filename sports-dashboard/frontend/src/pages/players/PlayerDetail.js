import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { playerService } from '../../services/api';
import { 
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer 
} from 'recharts';

const PlayerDetail = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [player, setPlayer] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [performance, setPerformance] = useState(null);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        setLoading(true);
        
        // Carregar dados do jogador
        const playerData = await playerService.getPlayer(id);
        setPlayer(playerData.player);
        
        // Carregar estatísticas do jogador
        const statsData = await playerService.getPlayerStatistics(id);
        setStatistics(statsData);
        
        // Carregar dados de performance do jogador
        const perfData = await playerService.getPlayerPerformance(id);
        setPerformance(perfData);
        
        setError(null);
      } catch (err) {
        setError('Erro ao carregar dados do jogador: ' + (err.error || 'Erro desconhecido'));
        console.error('Erro ao carregar dados do jogador:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPlayerData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-primary-600 text-xl">A carregar dados do jogador...</div>
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

  if (!player) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Aviso!</strong>
        <span className="block sm:inline"> Jogador não encontrado.</span>
      </div>
    );
  }

  // Preparar dados para o gráfico de radar
  const radarData = [
    {
      subject: 'Golos',
      A: statistics?.goals || 0,
      fullMark: 10,
    },
    {
      subject: 'Assistências',
      A: statistics?.assists || 0,
      fullMark: 10,
    },
    {
      subject: 'Precisão de Remates',
      A: statistics?.shot_accuracy || 0,
      fullMark: 100,
    },
    {
      subject: 'Precisão de Passes',
      A: statistics?.pass_accuracy || 0,
      fullMark: 100,
    },
    {
      subject: 'Desarmes',
      A: statistics?.tackles || 0,
      fullMark: 10,
    },
    {
      subject: 'Interceções',
      A: statistics?.interceptions || 0,
      fullMark: 10,
    },
  ];

  // Preparar dados para o gráfico de estatísticas por jogo
  const matchStatsData = statistics?.match_statistics || [];

  return (
    <div className="space-y-6">
      {/* Cabeçalho do jogador */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="flex flex-col md:flex-row items-center md:items-start">
          {player.photo_url && (
            <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 mb-4 md:mb-0 md:mr-6">
              <img 
                src={player.photo_url} 
                alt={`${player.name}`} 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{player.name}</h1>
            <div className="mt-2 text-gray-600">
              <p><span className="font-semibold">Posição:</span> {player.position}</p>
              <p><span className="font-semibold">Nacionalidade:</span> {player.nationality}</p>
              {player.jersey_number && (
                <p><span className="font-semibold">Número:</span> {player.jersey_number}</p>
              )}
              {player.birth_date && (
                <p><span className="font-semibold">Data de Nascimento:</span> {new Date(player.birth_date).toLocaleDateString()}</p>
              )}
              {player.height && (
                <p><span className="font-semibold">Altura:</span> {player.height} cm</p>
              )}
              {player.weight && (
                <p><span className="font-semibold">Peso:</span> {player.weight} kg</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Estatísticas do jogador */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-card p-6">
          <h3 className="text-lg font-semibold text-gray-700">Jogos</h3>
          <p className="text-3xl font-bold text-primary-600 mt-2">
            {statistics?.matches_played || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-card p-6">
          <h3 className="text-lg font-semibold text-gray-700">Golos</h3>
          <p className="text-3xl font-bold text-success mt-2">
            {statistics?.goals || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-card p-6">
          <h3 className="text-lg font-semibold text-gray-700">Assistências</h3>
          <p className="text-3xl font-bold text-info mt-2">
            {statistics?.assists || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-card p-6">
          <h3 className="text-lg font-semibold text-gray-700">Minutos Jogados</h3>
          <p className="text-3xl font-bold text-secondary-600 mt-2">
            {statistics?.minutes_played || 0}
          </p>
        </div>
      </div>
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de radar de habilidades */}
        <div className="bg-white rounded-lg shadow-card p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Perfil de Habilidades</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                <Radar
                  name={player.name}
                  dataKey="A"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Gráfico de golos e assistências por jogo */}
        <div className="bg-white rounded-lg shadow-card p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Golos e Assistências por Jogo</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={matchStatsData.slice(0, 10)}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="match_id" label={{ value: 'Jogo ID', position: 'insideBottom', offset: -5 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="goals" name="Golos" fill="#8884d8" />
                <Bar dataKey="assists" name="Assistências" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Performance e pontos fortes/fracos */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Análise de Performance</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Rating de performance */}
          <div className="flex flex-col items-center justify-center">
            <div className="text-6xl font-bold text-primary-600">
              {performance?.performance_rating?.toFixed(1) || '0.0'}
            </div>
            <div className="text-gray-600 mt-2">Rating de Performance</div>
          </div>
          
          {/* Pontos fortes */}
          <div>
            <h4 className="font-semibold text-success mb-2">Pontos Fortes</h4>
            {performance?.strengths?.length > 0 ? (
              <ul className="list-disc list-inside">
                {performance.strengths.map((strength, index) => (
                  <li key={index} className="text-gray-700">{strength}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Nenhum ponto forte identificado</p>
            )}
          </div>
          
          {/* Pontos fracos */}
          <div>
            <h4 className="font-semibold text-danger mb-2">Pontos a Melhorar</h4>
            {performance?.weaknesses?.length > 0 ? (
              <ul className="list-disc list-inside">
                {performance.weaknesses.map((weakness, index) => (
                  <li key={index} className="text-gray-700">{weakness}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Nenhum ponto fraco identificado</p>
            )}
          </div>
        </div>
        
        {/* Forma recente */}
        <div className="mt-6">
          <h4 className="font-semibold text-gray-700 mb-2">Forma Recente</h4>
          <div className="flex items-center space-x-4">
            {(performance?.form || []).map((rating, index) => (
              <div 
                key={index}
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                style={{ 
                  backgroundColor: `rgba(${Math.max(0, Math.min(255, 255 - (rating * 25)))}, ${Math.max(0, Math.min(255, rating * 25))}, 0, 0.8)` 
                }}
              >
                {rating.toFixed(1)}
              </div>
            ))}
            {performance?.form?.length === 0 && (
              <p className="text-gray-500">Sem dados de forma recente</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Estatísticas detalhadas */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Estatísticas Detalhadas</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Ofensivas</h4>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span className="text-gray-600">Golos:</span>
                <span className="font-medium">{statistics?.goals || 0}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Assistências:</span>
                <span className="font-medium">{statistics?.assists || 0}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Remates:</span>
                <span className="font-medium">{statistics?.shots || 0}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Remates à Baliza:</span>
                <span className="font-medium">{statistics?.shots_on_target || 0}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Precisão de Remates:</span>
                <span className="font-medium">{statistics?.shot_accuracy?.toFixed(1) || 0}%</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Passes</h4>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span className="text-gray-600">Passes Totais:</span>
                <span className="font-medium">{statistics?.passes || 0}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Precisão de Passes:</span>
                <span className="font-medium">{statistics?.pass_accuracy?.toFixed(1) || 0}%</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Defensivas</h4>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span className="text-gray-600">Desarmes:</span>
                <span className="font-medium">{statistics?.tackles || 0}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Interceções:</span>
                <span className="font-medium">{statistics?.interceptions || 0}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerDetail;
