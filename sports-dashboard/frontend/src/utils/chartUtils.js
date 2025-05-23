// Arquivo de integração principal para conectar todos os componentes do dashboard

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

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Tratamento de erros de autenticação
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Função para formatar dados para visualizações
export const formatChartData = (data, type) => {
  switch (type) {
    case 'bar':
      return data.map(item => ({
        name: item.label,
        value: item.value
      }));
    case 'line':
      return data.map(item => ({
        date: new Date(item.date).toLocaleDateString(),
        value: item.value
      }));
    case 'pie':
      return data.map(item => ({
        name: item.label,
        value: item.value
      }));
    case 'radar':
      return data.map(item => ({
        subject: item.label,
        A: item.valueA,
        B: item.valueB,
        fullMark: item.maxValue || 100
      }));
    default:
      return data;
  }
};

// Função para gerar cores para gráficos
export const generateChartColors = (count) => {
  const baseColors = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8',
    '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'
  ];
  
  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }
  
  // Gerar cores adicionais se necessário
  const colors = [...baseColors];
  for (let i = baseColors.length; i < count; i++) {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    colors.push(`rgb(${r}, ${g}, ${b})`);
  }
  
  return colors;
};

// Função para calcular estatísticas básicas
export const calculateStats = (data, key) => {
  if (!data || !data.length) return { min: 0, max: 0, avg: 0, sum: 0 };
  
  const values = data.map(item => item[key]).filter(val => !isNaN(val));
  
  if (!values.length) return { min: 0, max: 0, avg: 0, sum: 0 };
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  const sum = values.reduce((acc, val) => acc + val, 0);
  const avg = sum / values.length;
  
  return { min, max, avg, sum };
};

// Função para calcular tendência
export const calculateTrend = (data, key, periods = 5) => {
  if (!data || data.length < 2) return 0;
  
  // Pegar os últimos N períodos
  const recentData = data.slice(-periods);
  
  if (recentData.length < 2) return 0;
  
  // Calcular a média do primeiro e último período
  const firstValue = recentData[0][key];
  const lastValue = recentData[recentData.length - 1][key];
  
  // Calcular a variação percentual
  if (firstValue === 0) return lastValue > 0 ? 100 : 0;
  
  return ((lastValue - firstValue) / Math.abs(firstValue)) * 100;
};

// Exportar a instância da API e funções utilitárias
export default api;
