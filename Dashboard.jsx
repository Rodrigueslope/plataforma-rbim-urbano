import { useState, useEffect } from 'react'
import { 
  Users, 
  Activity, 
  MapPin, 
  Wifi,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'
import { dashboardService } from '@/services/api'

export function Dashboard() {
  const [stats, setStats] = useState(null)
  const [hourlyFlow, setHourlyFlow] = useState([])
  const [areaDistribution, setAreaDistribution] = useState([])
  const [weeklyTrends, setWeeklyTrends] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Carregar dados do dashboard
  useEffect(() => {
    loadDashboardData()
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(loadDashboardData, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Carregar todos os dados em paralelo
      const [
        statsData,
        hourlyData,
        distributionData,
        trendsData,
        alertsData
      ] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getHourlyFlow(),
        dashboardService.getAreaDistribution(),
        dashboardService.getWeeklyTrends(),
        dashboardService.getActiveAlerts()
      ])
      
      setStats(statsData)
      setHourlyFlow(hourlyData)
      setAreaDistribution(distributionData)
      setWeeklyTrends(trendsData)
      setAlerts(alertsData)
      setLastUpdate(new Date())
      setError(null)
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err)
      setError('Erro ao carregar dados. Usando dados de demonstração.')
      
      // Fallback para dados simulados em caso de erro
      setStats({
        current_people: 1257,
        people_change: 12,
        events_detected: 264,
        events_change: 8,
        total_passages: 645,
        passages_change: 15,
        active_sensors: 10,
        sensors_operational: 100
      })
      
      setHourlyFlow(generateHourlyData())
      setAreaDistribution(generateAreaData())
      setWeeklyTrends(generateWeeklyData())
      setAlerts([
        {
          id: 1,
          type: 'high_density',
          message: 'Alta concentração detectada',
          details: 'Área do Centro com 45 pessoas - 14:30',
          severity: 'warning',
          timestamp: new Date().toISOString()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  // Dados simulados para fallback
  const generateHourlyData = () => {
    const data = []
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, '0') + ':00'
      const baseValue = Math.sin((i - 6) * Math.PI / 12) * 20 + 25
      data.push({
        hour,
        pessoas: Math.max(5, Math.round(baseValue + Math.random() * 10))
      })
    }
    return data
  }

  const generateAreaData = () => [
    { name: 'Centro', value: 35, color: '#DC2626' },
    { name: 'Coreto', value: 25, color: '#EA580C' },
    { name: 'Bancos Norte', value: 20, color: '#10B981' },
    { name: 'Bancos Sul', value: 15, color: '#3B82F6' },
    { name: 'Caminhos', value: 5, color: '#6B7280' }
  ]

  const generateWeeklyData = () => [
    { day: 'Seg', pessoas: 120, eventos: 45 },
    { day: 'Ter', pessoas: 135, eventos: 52 },
    { day: 'Qua', pessoas: 142, eventos: 48 },
    { day: 'Qui', pessoas: 158, eventos: 55 },
    { day: 'Sex', pessoas: 185, eventos: 68 },
    { day: 'Sáb', pessoas: 220, eventos: 78 },
    { day: 'Dom', eventos: 65 }
  ]

  const formatLastUpdate = () => {
    return lastUpdate.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getChangeIcon = (change) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return null
  }

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando dados...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral da Praça da Independência em tempo real</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-700 border-green-300">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Ao vivo
          </Badge>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            Última atualização: {formatLastUpdate()}
          </div>
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

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pessoas na Praça</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.current_people || 0}</div>
            <div className={`text-xs flex items-center ${getChangeColor(stats?.people_change || 0)}`}>
              {getChangeIcon(stats?.people_change || 0)}
              <span className="ml-1">
                {stats?.people_change > 0 ? '+' : ''}{stats?.people_change || 0}% em relação a ontem
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Detectados</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.events_detected || 0}</div>
            <div className={`text-xs flex items-center ${getChangeColor(stats?.events_change || 0)}`}>
              {getChangeIcon(stats?.events_change || 0)}
              <span className="ml-1">
                {stats?.events_change > 0 ? '+' : ''}{stats?.events_change || 0}% em relação a ontem
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Passagens Registradas</CardTitle>
            <MapPin className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_passages || 0}</div>
            <div className={`text-xs flex items-center ${getChangeColor(stats?.passages_change || 0)}`}>
              {getChangeIcon(stats?.passages_change || 0)}
              <span className="ml-1">
                {stats?.passages_change > 0 ? '+' : ''}{stats?.passages_change || 0}% em relação a ontem
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sensores Ativos</CardTitle>
            <Wifi className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active_sensors || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.sensors_operational || 100}% operacional
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fluxo de Pessoas por Hora */}
        <Card>
          <CardHeader>
            <CardTitle>Fluxo de Pessoas por Hora</CardTitle>
            <CardDescription>Últimas 24 horas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={hourlyFlow}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="pessoas" 
                  stroke="#3B82F6" 
                  fill="#93C5FD" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição por Área */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Área</CardTitle>
            <CardDescription>Concentração atual de pessoas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={areaDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {areaDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tendências Semanais */}
      <Card>
        <CardHeader>
          <CardTitle>Tendências Semanais</CardTitle>
          <CardDescription>Comparação de pessoas e eventos por dia da semana</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="pessoas" fill="#3B82F6" name="Pessoas" />
              <Bar dataKey="eventos" fill="#F59E0B" name="Eventos" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Alertas e Notificações */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
              Alertas e Notificações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-yellow-800">{alert.message}</p>
                      <p className="text-sm text-yellow-600">{alert.details}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                    Ativo
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}