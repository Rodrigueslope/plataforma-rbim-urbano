// Módulo de análise preditiva e estatísticas avançadas
// para a plataforma de análise urbana

/**
 * Calcula tendências e previsões baseadas em dados históricos
 */
export class UrbanAnalytics {
  
  /**
   * Calcula média móvel simples
   * @param {Array} data - Array de valores numéricos
   * @param {number} period - Período da média móvel
   * @returns {Array} Array com médias móveis
   */
  static calculateMovingAverage(data, period = 7) {
    if (!data || data.length < period) return data
    
    const result = []
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
      result.push(sum / period)
    }
    return result
  }

  /**
   * Calcula tendência linear usando regressão linear simples
   * @param {Array} data - Array de valores [x, y]
   * @returns {Object} Coeficientes da linha de tendência
   */
  static calculateLinearTrend(data) {
    if (!data || data.length < 2) return { slope: 0, intercept: 0, r2: 0 }
    
    const n = data.length
    const sumX = data.reduce((sum, point) => sum + point[0], 0)
    const sumY = data.reduce((sum, point) => sum + point[1], 0)
    const sumXY = data.reduce((sum, point) => sum + point[0] * point[1], 0)
    const sumXX = data.reduce((sum, point) => sum + point[0] * point[0], 0)
    const sumYY = data.reduce((sum, point) => sum + point[1] * point[1], 0)
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n
    
    // Calcular R²
    const meanY = sumY / n
    const ssRes = data.reduce((sum, point) => {
      const predicted = slope * point[0] + intercept
      return sum + Math.pow(point[1] - predicted, 2)
    }, 0)
    const ssTot = data.reduce((sum, point) => sum + Math.pow(point[1] - meanY, 2), 0)
    const r2 = 1 - (ssRes / ssTot)
    
    return { slope, intercept, r2: Math.max(0, r2) }
  }

  /**
   * Prevê valores futuros baseado em tendência histórica
   * @param {Array} historicalData - Dados históricos [timestamp, value]
   * @param {number} periodsAhead - Número de períodos para prever
   * @returns {Array} Previsões futuras
   */
  static predictFutureTrends(historicalData, periodsAhead = 7) {
    if (!historicalData || historicalData.length < 3) return []
    
    // Converter timestamps para índices sequenciais
    const indexedData = historicalData.map((item, index) => [index, item[1]])
    
    // Calcular tendência
    const trend = this.calculateLinearTrend(indexedData)
    
    // Gerar previsões
    const predictions = []
    const lastIndex = historicalData.length - 1
    const lastTimestamp = historicalData[lastIndex][0]
    
    // Calcular intervalo de tempo entre pontos
    const timeInterval = historicalData.length > 1 
      ? historicalData[1][0] - historicalData[0][0]
      : 86400000 // 1 dia em ms como fallback
    
    for (let i = 1; i <= periodsAhead; i++) {
      const futureIndex = lastIndex + i
      const predictedValue = Math.max(0, trend.slope * futureIndex + trend.intercept)
      const futureTimestamp = lastTimestamp + (timeInterval * i)
      
      predictions.push({
        timestamp: futureTimestamp,
        predicted: Math.round(predictedValue),
        confidence: Math.min(0.95, trend.r2), // Confiança baseada em R²
        trend: trend.slope > 0 ? 'crescente' : trend.slope < 0 ? 'decrescente' : 'estável'
      })
    }
    
    return predictions
  }

  /**
   * Detecta padrões sazonais nos dados
   * @param {Array} data - Dados com timestamp e valor
   * @returns {Object} Padrões detectados
   */
  static detectSeasonalPatterns(data) {
    if (!data || data.length < 14) return null
    
    const patterns = {
      hourly: {},
      daily: {},
      weekly: {}
    }
    
    data.forEach(item => {
      const date = new Date(item.timestamp)
      const hour = date.getHours()
      const dayOfWeek = date.getDay()
      const dayOfMonth = date.getDate()
      
      // Padrões por hora
      if (!patterns.hourly[hour]) patterns.hourly[hour] = []
      patterns.hourly[hour].push(item.value)
      
      // Padrões por dia da semana
      if (!patterns.daily[dayOfWeek]) patterns.daily[dayOfWeek] = []
      patterns.daily[dayOfWeek].push(item.value)
      
      // Padrões semanais (primeira vs segunda quinzena)
      const weekOfMonth = Math.ceil(dayOfMonth / 7)
      if (!patterns.weekly[weekOfMonth]) patterns.weekly[weekOfMonth] = []
      patterns.weekly[weekOfMonth].push(item.value)
    })
    
    // Calcular médias para cada padrão
    const result = {
      hourlyAverages: {},
      dailyAverages: {},
      weeklyAverages: {},
      peakHours: [],
      peakDays: []
    }
    
    // Médias por hora
    Object.keys(patterns.hourly).forEach(hour => {
      const values = patterns.hourly[hour]
      result.hourlyAverages[hour] = values.reduce((a, b) => a + b, 0) / values.length
    })
    
    // Médias por dia da semana
    Object.keys(patterns.daily).forEach(day => {
      const values = patterns.daily[day]
      result.dailyAverages[day] = values.reduce((a, b) => a + b, 0) / values.length
    })
    
    // Médias semanais
    Object.keys(patterns.weekly).forEach(week => {
      const values = patterns.weekly[week]
      result.weeklyAverages[week] = values.reduce((a, b) => a + b, 0) / values.length
    })
    
    // Identificar horários de pico
    const hourlyEntries = Object.entries(result.hourlyAverages)
    hourlyEntries.sort((a, b) => b[1] - a[1])
    result.peakHours = hourlyEntries.slice(0, 3).map(([hour, avg]) => ({
      hour: parseInt(hour),
      average: Math.round(avg)
    }))
    
    // Identificar dias de pico
    const dailyEntries = Object.entries(result.dailyAverages)
    dailyEntries.sort((a, b) => b[1] - a[1])
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    result.peakDays = dailyEntries.slice(0, 3).map(([day, avg]) => ({
      day: dayNames[parseInt(day)],
      dayIndex: parseInt(day),
      average: Math.round(avg)
    }))
    
    return result
  }

  /**
   * Calcula métricas de densidade e ocupação
   * @param {Array} areaData - Dados das áreas
   * @param {Object} areaCapacities - Capacidades máximas por área
   * @returns {Object} Métricas calculadas
   */
  static calculateDensityMetrics(areaData, areaCapacities = {}) {
    if (!areaData || areaData.length === 0) return null
    
    const defaultCapacities = {
      'Centro': 80,
      'Coreto': 50,
      'Bancos Norte': 60,
      'Bancos Sul': 60,
      'Caminhos': 200
    }
    
    const capacities = { ...defaultCapacities, ...areaCapacities }
    
    const metrics = {
      totalPeople: 0,
      totalCapacity: 0,
      overallDensity: 0,
      areas: [],
      alerts: []
    }
    
    areaData.forEach(area => {
      const capacity = capacities[area.area_name] || 50
      const occupancyRate = area.people_count / capacity
      const densityLevel = this.getDensityLevel(occupancyRate)
      
      metrics.totalPeople += area.people_count
      metrics.totalCapacity += capacity
      
      const areaMetric = {
        name: area.area_name,
        people: area.people_count,
        capacity,
        occupancyRate: Math.round(occupancyRate * 100),
        densityLevel,
        status: occupancyRate > 0.8 ? 'crítico' : occupancyRate > 0.6 ? 'alto' : 'normal'
      }
      
      metrics.areas.push(areaMetric)
      
      // Gerar alertas para áreas com alta ocupação
      if (occupancyRate > 0.8) {
        metrics.alerts.push({
          type: 'high_density',
          area: area.area_name,
          message: `Alta densidade detectada em ${area.area_name}`,
          occupancy: Math.round(occupancyRate * 100),
          severity: occupancyRate > 0.9 ? 'crítico' : 'alto'
        })
      }
    })
    
    metrics.overallDensity = Math.round((metrics.totalPeople / metrics.totalCapacity) * 100)
    
    return metrics
  }

  /**
   * Determina o nível de densidade baseado na taxa de ocupação
   * @param {number} occupancyRate - Taxa de ocupação (0-1)
   * @returns {string} Nível de densidade
   */
  static getDensityLevel(occupancyRate) {
    if (occupancyRate >= 0.9) return 'Crítica'
    if (occupancyRate >= 0.7) return 'Alta'
    if (occupancyRate >= 0.4) return 'Média'
    if (occupancyRate >= 0.2) return 'Baixa'
    return 'Muito Baixa'
  }

  /**
   * Calcula estatísticas de fluxo de pessoas
   * @param {Array} flowData - Dados de fluxo por período
   * @returns {Object} Estatísticas de fluxo
   */
  static calculateFlowStatistics(flowData) {
    if (!flowData || flowData.length === 0) return null
    
    const values = flowData.map(item => item.people || item.value || 0)
    const sorted = [...values].sort((a, b) => a - b)
    
    const stats = {
      mean: values.reduce((a, b) => a + b, 0) / values.length,
      median: sorted[Math.floor(sorted.length / 2)],
      min: Math.min(...values),
      max: Math.max(...values),
      range: Math.max(...values) - Math.min(...values),
      standardDeviation: 0,
      variance: 0,
      percentiles: {
        p25: sorted[Math.floor(sorted.length * 0.25)],
        p75: sorted[Math.floor(sorted.length * 0.75)],
        p90: sorted[Math.floor(sorted.length * 0.90)],
        p95: sorted[Math.floor(sorted.length * 0.95)]
      }
    }
    
    // Calcular desvio padrão
    const variance = values.reduce((sum, value) => {
      return sum + Math.pow(value - stats.mean, 2)
    }, 0) / values.length
    
    stats.variance = variance
    stats.standardDeviation = Math.sqrt(variance)
    
    // Arredondar valores
    Object.keys(stats).forEach(key => {
      if (typeof stats[key] === 'number') {
        stats[key] = Math.round(stats[key] * 100) / 100
      }
    })
    
    Object.keys(stats.percentiles).forEach(key => {
      stats.percentiles[key] = Math.round(stats.percentiles[key])
    })
    
    return stats
  }

  /**
   * Gera insights automáticos baseados nos dados
   * @param {Object} data - Dados consolidados da plataforma
   * @returns {Array} Array de insights
   */
  static generateInsights(data) {
    const insights = []
    
    if (!data) return insights
    
    // Insight sobre tendência geral
    if (data.predictions && data.predictions.length > 0) {
      const trend = data.predictions[0].trend
      const confidence = Math.round(data.predictions[0].confidence * 100)
      
      insights.push({
        type: 'trend',
        title: 'Tendência de Visitação',
        message: `A tendência para os próximos dias é ${trend} com ${confidence}% de confiança.`,
        priority: confidence > 70 ? 'high' : 'medium',
        icon: 'trending-up'
      })
    }
    
    // Insight sobre padrões sazonais
    if (data.patterns && data.patterns.peakHours) {
      const peakHour = data.patterns.peakHours[0]
      insights.push({
        type: 'pattern',
        title: 'Horário de Pico',
        message: `O horário de maior movimento é às ${peakHour.hour}:00 com média de ${peakHour.average} pessoas.`,
        priority: 'medium',
        icon: 'clock'
      })
    }
    
    // Insight sobre densidade
    if (data.density && data.density.alerts.length > 0) {
      const criticalAlerts = data.density.alerts.filter(alert => alert.severity === 'crítico')
      if (criticalAlerts.length > 0) {
        insights.push({
          type: 'alert',
          title: 'Densidade Crítica',
          message: `${criticalAlerts.length} área(s) com densidade crítica detectada.`,
          priority: 'high',
          icon: 'alert-triangle'
        })
      }
    }
    
    // Insight sobre fluxo
    if (data.flowStats) {
      const variation = (data.flowStats.standardDeviation / data.flowStats.mean) * 100
      if (variation > 50) {
        insights.push({
          type: 'variability',
          title: 'Alta Variabilidade',
          message: `O fluxo de pessoas apresenta alta variabilidade (${Math.round(variation)}%).`,
          priority: 'medium',
          icon: 'activity'
        })
      }
    }
    
    return insights
  }

  /**
   * Calcula score de qualidade dos dados
   * @param {Object} data - Dados para análise
   * @returns {Object} Score e detalhes da qualidade
   */
  static calculateDataQuality(data) {
    let score = 100
    const issues = []
    
    if (!data) {
      return { score: 0, issues: ['Nenhum dado disponível'], quality: 'Crítica' }
    }
    
    // Verificar completude dos dados
    if (!data.sensors || data.sensors.length === 0) {
      score -= 20
      issues.push('Dados de sensores ausentes')
    }
    
    if (!data.areas || data.areas.length === 0) {
      score -= 15
      issues.push('Dados de áreas ausentes')
    }
    
    // Verificar atualização dos dados
    if (data.lastUpdate) {
      const timeSinceUpdate = Date.now() - new Date(data.lastUpdate).getTime()
      const minutesSinceUpdate = timeSinceUpdate / (1000 * 60)
      
      if (minutesSinceUpdate > 60) {
        score -= 25
        issues.push('Dados desatualizados (>1h)')
      } else if (minutesSinceUpdate > 30) {
        score -= 10
        issues.push('Dados parcialmente desatualizados (>30min)')
      }
    }
    
    // Verificar consistência dos dados
    if (data.areas && data.areas.length > 0) {
      const totalPeople = data.areas.reduce((sum, area) => sum + (area.people_count || 0), 0)
      if (totalPeople === 0) {
        score -= 15
        issues.push('Nenhuma pessoa detectada em todas as áreas')
      }
    }
    
    const quality = score >= 80 ? 'Excelente' : 
                   score >= 60 ? 'Boa' : 
                   score >= 40 ? 'Regular' : 'Crítica'
    
    return {
      score: Math.max(0, score),
      quality,
      issues
    }
  }
}

// Funções utilitárias para formatação e visualização
export const formatters = {
  /**
   * Formata número com separadores de milhares
   */
  formatNumber: (num) => {
    return new Intl.NumberFormat('pt-BR').format(num)
  },
  
  /**
   * Formata porcentagem
   */
  formatPercentage: (num, decimals = 1) => {
    return `${(num * 100).toFixed(decimals)}%`
  },
  
  /**
   * Formata duração em minutos para formato HH:MM
   */
  formatDuration: (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  },
  
  /**
   * Formata timestamp para data/hora legível
   */
  formatDateTime: (timestamp) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

export default UrbanAnalytics

