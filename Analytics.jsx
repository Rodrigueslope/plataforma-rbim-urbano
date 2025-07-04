import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Target,
  Lightbulb,
  RefreshCw,
  Calendar,
  Filter
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from 'recharts'
import { dashboardService, heatmapService } from '@/services/api'
import UrbanAnalytics, { formatters } from '@/utils/analytics'

export function Analytics() {
  const [analyticsData, setAnalyticsData] = useState(null)
  const [predictions, setPredictions] = useState([])
  const [patterns, setPatterns] = useState(null)
  const [insights, setInsights] = useState([])
  const [dataQuality, setDataQuality] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState('7d')
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    loadAnalyticsData()
    
    // Atualizar dados a cada 5 minutos
    const interval = setInterval(loadAnalyticsData, 300000)
    
    return () => clearInterval(interval)
  }, [selectedPeriod])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      
      // Carregar dados históricos
      const [statsData, weeklyTrends, hourlyFlow] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getWeeklyTrends(),
        dashboardService.getHourlyFlow()
      ])
      
      // Processar dados para análise
      const processedData = processDataForAnalytics(statsData, weeklyTrends, hourlyFlow)
      setAnalyticsData(processedData)
      
      // Gerar previsões
      const historicalData = hourlyFlow.map((item, index) => [
        Date.now() - (23 - index) * 3600000, // Últimas 24 horas
        item.pessoas
      ])
      
      const futurePredictions = UrbanAnalytics.predictFutureTrends(historicalData, 7)
      setPredictions(futurePredictions)
      
      // Detectar padrões sazonais
      const seasonalData = hourlyFlow.map((item, index) => ({
        timestamp: Date.now() - (23 - index) * 3600000,
        value: item.pessoas
      }))
      
      const detectedPatterns = UrbanAnalytics.detectSeasonalPatterns(seasonalData)
      setPatterns(detectedPatterns)
      
      // Gerar insights
      const consolidatedData = {
        predictions: futurePredictions,
        patterns: detectedPatterns,
        flowStats: UrbanAnalytics.calculateFlowStatistics(hourlyFlow)
      }
      
      const generatedInsights = UrbanAnalytics.generateInsights(consolidatedData)
      setInsights(generatedInsights)
      
      // Calcular qualidade dos dados
      const quality = UrbanAnalytics.calculateDataQuality({
        sensors: Array.from({length: 10}, (_, i) => ({id: i + 1})),
        areas: ['Centro', 'Coreto', 'Bancos Norte', 'Bancos Sul', 'Caminhos'],
        lastUpdate: new Date().toISOString()
      })
      setDataQuality(quality)
      
      setLastUpdate(new Date())
      setError(null)
      
    } catch (err) {
      console.error('Erro ao carregar dados de analytics:', err)
      setError('Erro ao carregar análises. Usando dados de demonstração.')
      
      // Fallback para dados simulados
      loadFallbackData()
    } finally {
      setLoading(false)
    }
  }

  const processDataForAnalytics = (stats, weekly, hourly) => {
    return {
      currentStats: stats,
      weeklyTrends: weekly,
      hourlyFlow: hourly,
      totalVisitors: stats.current_people || 0,
      avgDailyFlow: weekly.reduce((sum, day) => sum + (day.pessoas || 0), 0) / weekly.length
    }
  }

  const loadFallbackData = () => {
    // Dados simulados para demonstração
    const mockHourlyData = Array.from({length: 24}, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      pessoas: Math.floor(Math.sin((i - 6) * Math.PI / 12) * 20 + 25 + Math.random() * 10)
    }))
    
    const mockWeeklyData = [
      { day: 'Seg', pessoas: 120 },
      { day: 'Ter', pessoas: 135 },
      { day: 'Qua', pessoas: 142 },
      { day: 'Qui', pessoas: 158 },
      { day: 'Sex', pessoas: 185 },
      { day: 'Sáb', pessoas: 220 },
      { day: 'Dom', pessoas: 195 }
    ]
    
    setAnalyticsData({
      currentStats: { current_people: 135, events_detected: 45 },
      weeklyTrends: mockWeeklyData,
      hourlyFlow: mockHourlyData,
      totalVisitors: 135,
      avgDailyFlow: 165
    })
    
    // Gerar previsões simuladas
    const mockPredictions = Array.from({length: 7}, (_, i) => ({
      timestamp: Date.now() + (i + 1) * 86400000,
      predicted: Math.floor(150 + Math.sin(i * 0.5) * 30 + Math.random() * 20),
      confidence: 0.75 + Math.random() * 0.2,
      trend: 'crescente'
    }))
    setPredictions(mockPredictions)
    
    // Padrões simulados
    setPatterns({
      peakHours: [
        { hour: 14, average: 65 },
        { hour: 18, average: 58 },
        { hour: 11, average: 52 }
      ],
      peakDays: [
        { day: 'Sábado', average: 220 },
        { day: 'Domingo', average: 195 },
        { day: 'Sexta', average: 185 }
      ]
    })
    
    // Insights simulados
    setInsights([
      {
        type: 'trend',
        title: 'Tendência Crescente',
        message: 'A visitação está crescendo 15% em relação ao mês anterior.',
        priority: 'high',
        icon: 'trending-up'
      },
      {
        type: 'pattern',
        title: 'Pico às 14h',
        message: 'O horário de maior movimento é às 14:00 com média de 65 pessoas.',
        priority: 'medium',
        icon: 'clock'
      }
    ])
    
    setDataQuality({
      score: 85,
      quality: 'Boa',
      issues: ['Dados simulados para demonstração']
    })
  }

  const refreshData = () => {
    loadAnalyticsData()
  }

  const formatLastUpdate = () => {
    return lastUpdate.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  const getIconComponent = (iconName) => {
    const icons = {
      'trending-up': TrendingUp,
      'trending-down': TrendingDown,
      'clock': Clock,
      'alert-triangle': AlertTriangle,
      'activity': Activity,
      'users': Users
    }
    const IconComponent = icons[iconName] || Activity
    return <IconComponent className="h-4 w-4" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando análises...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Preditivo</h1>
          <p className="text-gray-600">Análises avançadas e previsões para a Praça da Independência</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 Horas</SelectItem>
              <SelectItem value="7d">7 Dias</SelectItem>
              <SelectItem value="30d">30 Dias</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Erro de conexão */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800">{error}</span>
          </div>
        </div>
      )}

      {/* Qualidade dos Dados */}
      {dataQuality && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Qualidade dos Dados
            </CardTitle>
            <CardDescription>Última atualização: {formatLastUpdate()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-bold text-blue-600">{dataQuality.score}%</div>
                <div>
                  <div className="font-medium">{dataQuality.quality}</div>
                  <div className="text-sm text-gray-500">
                    {dataQuality.issues.length} {dataQuality.issues.length === 1 ? 'problema' : 'problemas'} detectado(s)
                  </div>
                </div>
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${dataQuality.score}%` }}
                ></div>
              </div>
            </div>
            {dataQuality.issues.length > 0 && (
              <div className="mt-4 space-y-1">
                {dataQuality.issues.map((issue, index) => (
                  <div key={index} className="text-sm text-gray-600 flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-2 text-yellow-500" />
                    {issue}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="predictions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predictions">Previsões</TabsTrigger>
          <TabsTrigger value="patterns">Padrões</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="statistics">Estatísticas</TabsTrigger>
        </TabsList>

        {/* Aba de Previsões */}
        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Previsões */}
            <Card>
              <CardHeader>
                <CardTitle>Previsão de Visitação - Próximos 7 Dias</CardTitle>
                <CardDescription>Baseado em tendências históricas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={predictions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(timestamp) => new Date(timestamp).toLocaleDateString('pt-BR')}
                      formatter={(value, name) => [value, 'Pessoas Previstas']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Métricas de Previsão */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Previsão</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {predictions.slice(0, 3).map((prediction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">
                        {new Date(prediction.timestamp).toLocaleDateString('pt-BR', { 
                          weekday: 'long', 
                          day: '2-digit', 
                          month: '2-digit' 
                        })}
                      </div>
                      <div className="text-sm text-gray-600">
                        Confiança: {Math.round(prediction.confidence * 100)}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {prediction.predicted}
                      </div>
                      <div className="text-sm text-gray-500">pessoas</div>
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tendência Geral:</span>
                    <Badge variant="outline" className="text-green-700 border-green-300">
                      {predictions[0]?.trend || 'Estável'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba de Padrões */}
        <TabsContent value="patterns" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Padrões por Hora */}
            <Card>
              <CardHeader>
                <CardTitle>Horários de Pico</CardTitle>
                <CardDescription>Baseado em dados históricos</CardDescription>
              </CardHeader>
              <CardContent>
                {patterns?.peakHours ? (
                  <div className="space-y-3">
                    {patterns.peakHours.map((peak, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center">
                          <Clock className="h-5 w-5 text-blue-600 mr-3" />
                          <div>
                            <div className="font-medium">{peak.hour}:00</div>
                            <div className="text-sm text-gray-600">#{index + 1} horário de pico</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">{peak.average}</div>
                          <div className="text-sm text-gray-500">pessoas</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    Dados insuficientes para detectar padrões
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Padrões por Dia */}
            <Card>
              <CardHeader>
                <CardTitle>Dias de Maior Movimento</CardTitle>
                <CardDescription>Média semanal de visitação</CardDescription>
              </CardHeader>
              <CardContent>
                {patterns?.peakDays ? (
                  <div className="space-y-3">
                    {patterns.peakDays.map((peak, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-green-600 mr-3" />
                          <div>
                            <div className="font-medium">{peak.day}</div>
                            <div className="text-sm text-gray-600">#{index + 1} dia da semana</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">{peak.average}</div>
                          <div className="text-sm text-gray-500">pessoas</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    Dados insuficientes para detectar padrões
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba de Insights */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {insights.map((insight, index) => (
              <Card key={index} className={`border-l-4 ${getPriorityColor(insight.priority)}`}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {getIconComponent(insight.icon)}
                    <span className="ml-2">{insight.title}</span>
                    <Badge 
                      variant="outline" 
                      className={`ml-auto ${getPriorityColor(insight.priority)}`}
                    >
                      {insight.priority === 'high' ? 'Alta' : insight.priority === 'medium' ? 'Média' : 'Baixa'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{insight.message}</p>
                </CardContent>
              </Card>
            ))}
            
            {insights.length === 0 && (
              <Card className="lg:col-span-2">
                <CardContent className="text-center py-8">
                  <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum insight disponível no momento.</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Insights serão gerados conforme mais dados forem coletados.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Aba de Estatísticas */}
        <TabsContent value="statistics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Visitantes Atuais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {analyticsData?.totalVisitors || 0}
                </div>
                <p className="text-sm text-gray-500 mt-1">pessoas na praça</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Média Diária</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {Math.round(analyticsData?.avgDailyFlow || 0)}
                </div>
                <p className="text-sm text-gray-500 mt-1">pessoas/dia</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Eventos Detectados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">
                  {analyticsData?.currentStats?.events_detected || 0}
                </div>
                <p className="text-sm text-gray-500 mt-1">hoje</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Confiança Média</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {predictions.length > 0 
                    ? Math.round(predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length * 100)
                    : 0}%
                </div>
                <p className="text-sm text-gray-500 mt-1">das previsões</p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Tendências */}
          {analyticsData?.weeklyTrends && (
            <Card>
              <CardHeader>
                <CardTitle>Tendência Semanal</CardTitle>
                <CardDescription>Visitação por dia da semana</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.weeklyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="pessoas" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

