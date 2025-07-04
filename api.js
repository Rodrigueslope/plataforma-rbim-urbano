// Configuração base da API
const API_BASE_URL = 'http://localhost:5000/api'

// Função auxiliar para fazer requisições
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  }
  
  const config = { ...defaultOptions, ...options }
  
  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error)
    throw error
  }
}

// Serviços de Dashboard
export const dashboardService = {
  // Obter estatísticas gerais
  async getStats() {
    return apiRequest('/dashboard/stats')
  },
  
  // Obter dados do gráfico de fluxo por hora
  async getHourlyFlow(date = null) {
    const params = date ? `?date=${date}` : ''
    return apiRequest(`/dashboard/hourly-flow${params}`)
  },
  
  // Obter distribuição por área
  async getAreaDistribution() {
    return apiRequest('/dashboard/area-distribution')
  },
  
  // Obter tendências semanais
  async getWeeklyTrends() {
    return apiRequest('/dashboard/weekly-trends')
  },
  
  // Obter alertas ativos
  async getActiveAlerts() {
    return apiRequest('/dashboard/alerts')
  }
}

// Serviços de Mapa de Calor
export const heatmapService = {
  // Obter dados do mapa de calor atual
  async getCurrentHeatmap() {
    return apiRequest('/heatmap/current')
  },
  
  // Obter dados históricos do mapa de calor
  async getHistoricalHeatmap(startDate, endDate, timeFilter = '1h') {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
      time_filter: timeFilter
    })
    return apiRequest(`/heatmap/historical?${params}`)
  },
  
  // Obter dados por área específica
  async getAreaData(areaId, timeFilter = '1h') {
    return apiRequest(`/heatmap/area/${areaId}?time_filter=${timeFilter}`)
  }
}

// Serviços de Áreas
export const areasService = {
  // Listar todas as áreas
  async getAreas() {
    return apiRequest('/areas')
  },
  
  // Obter detalhes de uma área específica
  async getAreaDetails(areaId) {
    return apiRequest(`/areas/${areaId}`)
  },
  
  // Obter estatísticas de uma área
  async getAreaStats(areaId, period = '24h') {
    return apiRequest(`/areas/${areaId}/stats?period=${period}`)
  }
}

// Serviços de Sensores
export const sensorsService = {
  // Listar todos os sensores
  async getSensors() {
    return apiRequest('/sensors')
  },
  
  // Obter status dos sensores
  async getSensorStatus() {
    return apiRequest('/sensors/status')
  },
  
  // Obter dados de um sensor específico
  async getSensorData(sensorId, startDate, endDate) {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate
    })
    return apiRequest(`/sensors/${sensorId}/data?${params}`)
  },
  
  // Obter últimas leituras dos sensores
  async getLatestReadings() {
    return apiRequest('/sensors/latest')
  }
}

// Serviços de Relatórios
export const reportsService = {
  // Gerar relatório
  async generateReport(reportData) {
    return apiRequest('/reports/generate', {
      method: 'POST',
      body: JSON.stringify(reportData)
    })
  },
  
  // Listar relatórios existentes
  async getReports() {
    return apiRequest('/reports')
  },
  
  // Baixar relatório
  async downloadReport(reportId) {
    const response = await fetch(`${API_BASE_URL}/reports/${reportId}/download`)
    return response.blob()
  },
  
  // Deletar relatório
  async deleteReport(reportId) {
    return apiRequest(`/reports/${reportId}`, {
      method: 'DELETE'
    })
  },
  
  // Obter dados para exportação
  async getExportData(startDate, endDate, areas = []) {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
      areas: areas.join(',')
    })
    return apiRequest(`/reports/export-data?${params}`)
  },

  // Exportar dados de sensores
  async exportSensorData(exportData) {
    try {
      const response = await fetch(`${API_BASE_URL}/export/sensor-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportData)
      })
      if (!response.ok) {
        throw new Error('Erro ao exportar dados de sensores')
      }
      return await response.blob()
    } catch (error) {
      console.error('Erro ao exportar dados de sensores:', error)
      throw error
    }
  },

  // Exportar dados do mapa de calor
  async exportHeatmapData(exportData) {
    try {
      const response = await fetch(`${API_BASE_URL}/export/heatmap-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportData)
      })
      if (!response.ok) {
        throw new Error('Erro ao exportar dados do mapa de calor')
      }
      return await response.blob()
    } catch (error) {
      console.error('Erro ao exportar dados do mapa de calor:', error)
      throw error
    }
  }
}

// Serviços de Configurações
export const settingsService = {
  // Obter configurações atuais
  async getSettings() {
    return apiRequest('/settings')
  },
  
  // Atualizar configurações
  async updateSettings(settings) {
    return apiRequest('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    })
  },
  
  // Restaurar configurações padrão
  async resetSettings() {
    return apiRequest('/settings/reset', {
      method: 'POST'
    })
  }
}

// Utilitários
export const utils = {
  // Formatar data para API
  formatDateForAPI(date) {
    return date.toISOString().split('T')[0]
  },
  
  // Formatar data e hora para API
  formatDateTimeForAPI(date) {
    return date.toISOString()
  },
  
  // Converter dados do mapa de calor para formato de visualização
  processHeatmapData(apiData) {
    return apiData.map(item => ({
      area_id: item.area_id,
      area_name: item.area_name,
      density: item.density,
      people_count: item.people_count,
      coordinates: item.coordinates,
      color: getHeatmapColor(item.density),
      opacity: Math.max(0.3, item.density)
    }))
  },
  
  // Obter cor do mapa de calor baseada na densidade
  getHeatmapColor(density) {
    if (density >= 0.8) return '#DC2626' // Vermelho - Alta densidade
    if (density >= 0.6) return '#EA580C' // Laranja - Média-alta densidade
    if (density >= 0.4) return '#F59E0B' // Amarelo - Média densidade
    if (density >= 0.2) return '#10B981' // Verde - Baixa densidade
    return '#3B82F6' // Azul - Muito baixa densidade
  }
}

// Função auxiliar para obter cor do mapa de calor
function getHeatmapColor(density) {
  if (density >= 0.8) return '#DC2626'
  if (density >= 0.6) return '#EA580C'
  if (density >= 0.4) return '#F59E0B'
  if (density >= 0.2) return '#10B981'
  return '#3B82F6'
}

export default {
  dashboardService,
  heatmapService,
  areasService,
  sensorsService,
  reportsService,
  settingsService,
  utils
}

