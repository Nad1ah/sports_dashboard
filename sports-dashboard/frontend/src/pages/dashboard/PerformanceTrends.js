import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/api';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const PerformanceTrends = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [filters, setFilters] = useState({
    entity_type: 'team',
    entity_id: '',
    metric: 'goals',
    period: 'season',
  });

  // Opções de filtro
  const metricOptions = [
    { value: 'goals', label: 'Golos' },
    { value: 'possession', label: 'Posse de Bola (%)' },
    { value: 'shots', label: 'Remates' },
    { value: 'passes', label: 'Passes' },
    { value: 'tackles', label: 'Desarmes' },
  ];

  const periodOptions = [
    { value: 'last_5', label: 'Últimos 5 Jogos' },
    { value: 'last_10', label: 'Últimos 10 Jogos' },
    { value: 'season', label: 'Temporada Completa' },
  ];

  // Função para buscar dados de performance
  const fetchPerformanceData = async () => {
    if (!filters.entity_id) {
      setError('Por favor, selecione uma equipa ou jogador.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getPerformanceTrends(filters);
      setPerformanceData(data);
    } catch (err) {
      setError('Erro ao carregar dados de performance: ' + (err.error || 'Erro desconhecido'));
      console.error('Erro ao carregar dados de performance:', err);
    } finally {
      setLoading(false);
    }
  };

  // Atualizar dados quando os filtros mudarem
  useEffect(() => {
    if (filters.entity_id) {
      fetchPerformanceData();
    }
  }, [filters.entity_id, filters.metric, filters.period]);

  // Função para atualizar filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Tendências de Performance</h1>
      
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="entity_type" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              id="entity_type"
              name="entity_type"
              value={filters.entity_type}
              onChange={handleFilterChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="team">Equipa</option>
              <option value="player">Jogador</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="entity_id" className="block text-sm font-medium text-gray-700 mb-1">
              {filters.entity_type === 'team' ? 'Equipa' : 'Jogador'}
            </label>
            <input
              type="text"
              id="entity_id"
              name="entity_id"
              value={filters.entity_id}
              onChange={handleFilterChange}
              placeholder={`ID do ${filters.entity_type === 'team' ? 'equipa' : 'jogador'}`}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            />
          </div>
          
          <div>
            <label htmlFor="metric" className="block text-sm font-medium text-gray-700 mb-1">
              Métrica
            </label>
            <select
              id="metric"
              name="metric"
              value={filters.metric}
              onChange={handleFilterChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              {metricOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-1">
              Período
            </label>
            <select
              id="period"
              name="period"
              value={filters.period}
              onChange={handleFilterChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-4">
          <button
            onClick={fetchPerformanceData}
            disabled={loading || !filters.entity_id}
            className={`w-full md:w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
              (loading || !filters.entity_id) ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'A carregar...' : 'Atualizar Dados'}
          </button>
        </div>
        
        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
      </div>
      
      {/* Gráfico de tendências */}
      {performanceData && (
        <div className="bg-white rounded-lg shadow-card p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Tendência de {metricOptions.find(o => o.value === filters.metric)?.label || filters.metric}
          </h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={performanceData.trend_data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="match_date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value, name) => [value, metricOptions.find(o => o.value === filters.metric)?.label || name]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  name={filters.entity_type === 'team' ? 'Equipa' : 'Jogador'}
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
                {performanceData.average_line && (
                  <Line
                    type="monotone"
                    dataKey="average"
                    name="Média"
                    stroke="#82ca9d"
                    strokeDasharray="5 5"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Estatísticas resumidas */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500">Média</h4>
              <p className="mt-1 text-2xl font-semibold text-primary-600">
                {performanceData.statistics?.average?.toFixed(2) || '0'}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500">Máximo</h4>
              <p className="mt-1 text-2xl font-semibold text-success">
                {performanceData.statistics?.max?.toFixed(2) || '0'}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500">Tendência</h4>
              <p className={`mt-1 text-2xl font-semibold ${
                performanceData.statistics?.trend > 0 
                  ? 'text-success' 
                  : performanceData.statistics?.trend < 0 
                    ? 'text-danger' 
                    : 'text-gray-500'
              }`}>
                {performanceData.statistics?.trend > 0 ? '↑' : performanceData.statistics?.trend < 0 ? '↓' : '→'}
                {' '}
                {Math.abs(performanceData.statistics?.trend || 0).toFixed(2)}%
              </p>
            </div>
          </div>
          
          {/* Análise de tendência */}
          {performanceData.analysis && (
            <div className="mt-6">
              <h4 className="text-md font-medium text-gray-700 mb-2">Análise</h4>
              <div className="prose max-w-none">
                <p>{performanceData.analysis}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PerformanceTrends;
