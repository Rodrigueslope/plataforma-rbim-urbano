import { useState, useEffect } from 'react'
import { 
  Clock, 
  Calendar, 
  Filter, 
  Download, 
  Maximize2,
  Users,
  Timer,
  MapPin,
  Layers,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { heatmapService, areasService, utils } from '@/services/api'

const timeFilters = [
  { value: '1h', label: '1 Hora' },
  { value: '6h', label: '6 Horas' },
  { value: '12h', label: '12 Horas' },
  { value: '24h', label: '24 Horas' },
  { value: 'custom', label: 'Personalizado' }
]

export function HeatMap() {
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('1h')
  const [selectedAreas, setSelectedAreas] = useState([])
  const [areas, setAreas] = useState([])
  const [heatmapData, setHeatmapData] = useState([])
  const [currentVisitors, setCurrentVisitors] = useState(0)
  const [avgDuration, setAvgDuration] = useState('00:00')
  const [mostActiveArea, setMostActiveArea] = useState('Centro')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData()
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(loadHeatmapData, 30000)
    
    return () => clearInterval(interval)
  }, [])

  // Recarregar dados quando filtro de tempo mudar
  useEffect(() => {
    if (areas.length > 0) {
      loadHeatmapData()
    }
  }, [selectedTimeFilter])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      
      // Carregar áreas disponíveis
      const areasData = await areasService.getAreas()
      setAreas(areasData)
      setSelectedAreas(areasData.map(area => area.id))
      
      // Carregar dados do mapa de calor
      await loadHeatmapData()
      
      setError(null)
    } catch (err) {
      console.error('Erro ao carregar dados iniciais:', err)
      setError('Erro ao carregar dados. Usando dados de demonstração.')
      
      // Fallback para dados simulados
      const fallbackAreas = [
        { 
          id: 1, 
          name: 'Centro', 
          color: '#DC2626', 
          coordinates: { x: 50, y: 50, width: 100, height: 100 }
        },
        { 
          id: 2, 
          name: 'Coreto', 
          color: '#EA580C', 
          coordinates: { x: 150, y: 30, width: 60, height: 60 }
        },
        { 
          id: 3, 
          name: 'Bancos Norte', 
          color: '#059669', 
          coordinates: { x: 40, y: 170, width: 80, height: 40 }
        },
        { 
          id: 4, 
          name: 'Bancos Sul', 
          color: '#0284C7', 
          coordinates: { x: 40, y: 10, width: 80, height: 40 }
        },
        { 
          id: 5, 
          name: 'Caminhos', 
          color: '#6B7280', 
          coordinates: { x: 0, y: 0, width: 250, height: 220 }
        }
      ]
      
      setAreas(fallbackAreas)
      setSelectedAreas(fallbackAreas.map(area => area.id))
      setHeatmapData(generateFallbackData(fallbackAreas))
      setCurrentVisitors(135)
      setAvgDuration('00:23')
      setMostActiveArea('Centro')
    } finally {
      setLoading(false)
    }
  }

  const loadHeatmapData = async () => {
    try {
      // Carregar dados do mapa de calor atual
      const heatmapResponse = await heatmapService.getCurrentHeatmap()
      
      // Processar dados para visualização
      const processedData = utils.processHeatmapData(heatmapResponse.areas || [])
      setHeatmapData(processedData)
      
      // Atualizar estatísticas
      setCurrentVisitors(heatmapResponse.total_visitors || 0)
      setAvgDuration(heatmapResponse.avg_duration || '00:00')
      setMostActiveArea(heatmapResponse.most_active_area || 'Centro')
      setLastUpdate(new Date())
      
    } catch (err) {
      console.error('Erro ao carregar dados do mapa de calor:', err)
      
      // Se já temos áreas carregadas, usar dados simulados
      if (areas.length > 0) {
        setHeatmapData(generateFallbackData(areas))
      }
    }
  }

  const generateFallbackData = (areasData) => {
    return areasData.map(area => ({
      area_id: area.id,
      area_name: area.name,
      density: Math.random() * 0.8 + 0.2, // 20% a 100%
      people_count: Math.floor(Math.random() * 50) + 10,
      coordinates: area.coordinates,
      color: utils.getHeatmapColor(Math.random() * 0.8 + 0.2),
      opacity: Math.max(0.3, Math.random() * 0.8 + 0.2)
    }))
  }

  const toggleArea = (areaId) => {
    setSelectedAreas(prev => 
      prev.includes(areaId) 
        ? prev.filter(id => id !== areaId)
        : [...prev, areaId]
    )
  }

  const exportHeatmap = async () => {
    try {
      // Em produção, isso faria a exportação real
      alert('Exportando mapa de calor...')
    } catch (err) {
      console.error('Erro ao exportar:', err)
    }
  }

  const refreshData = () => {
    loadHeatmapData()
  }

  const formatLastUpdate = () => {
    return lastUpdate.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando mapa de calor...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mapa de Calor</h1>
          <p className="text-gray-600">Visualização em tempo real do fluxo de pessoas na praça</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-700 border-green-300">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Ao vivo
          </Badge>
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm" onClick={exportHeatmap}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Erro de conexão */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800">{error}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Controles */}
        <div className="lg:col-span-1 space-y-4">
          {/* Filtros de Tempo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Período
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {timeFilters.slice(0, 4).map((filter) => (
                  <Button
                    key={filter.value}
                    variant={selectedTimeFilter === filter.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTimeFilter(filter.value)}
                    className="w-full"
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Seleção de Áreas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Layers className="h-5 w-5 mr-2" />
                Áreas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {areas.map((area) => (
                <div key={area.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: area.color || utils.getHeatmapColor(0.5) }}
                    ></div>
                    <Label className="text-sm font-medium">{area.name}</Label>
                  </div>
                  <Switch
                    checked={selectedAreas.includes(area.id)}
                    onCheckedChange={() => toggleArea(area.id)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Estatísticas Atuais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estatísticas</CardTitle>
              <CardDescription>Atualizado: {formatLastUpdate()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="text-sm">Visitantes</span>
                </div>
                <span className="font-bold text-lg">{currentVisitors}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Timer className="h-4 w-4 mr-2 text-green-600" />
                  <span className="text-sm">Duração Média</span>
                </div>
                <span className="font-bold text-lg">{avgDuration}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-purple-600" />
                  <span className="text-sm">Área Mais Movimentada</span>
                </div>
                <Badge variant="outline">{mostActiveArea}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Legenda */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Legenda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-600 rounded"></div>
                <span className="text-sm">Alta densidade (80-100%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-orange-600 rounded"></div>
                <span className="text-sm">Média-alta (60-80%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-sm">Média (40-60%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm">Baixa (20-40%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm">Muito baixa (0-20%)</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mapa de Calor */}
        <div className="lg:col-span-3">
          <Card className={isFullscreen ? "fixed inset-4 z-50" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Praça da Independência</CardTitle>
                  <CardDescription>
                    Mapa de calor - Período: {timeFilters.find(f => f.value === selectedTimeFilter)?.label}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '500px' }}>
                {/* SVG do Mapa da Praça */}
                <svg 
                  viewBox="0 0 300 250" 
                  className="w-full h-full"
                  style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' }}
                >
                  {/* Fundo da praça */}
                  <rect x="0" y="0" width="300" height="250" fill="#f8fafc" />
                  
                  {/* Renderizar áreas com dados do backend */}
                  {heatmapData.map((areaData) => {
                    if (!selectedAreas.includes(areaData.area_id)) return null
                    
                    return (
                      <g key={areaData.area_id}>
                        {areaData.area_name === 'Centro' && (
                          <>
                            <circle cx="150" cy="125" r="40" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="2" />
                            <circle cx="150" cy="125" r="8" fill="#374151" />
                            <text x="150" y="135" textAnchor="middle" className="text-xs fill-gray-700">Obelisco</text>
                            <circle 
                              cx="150" cy="125" r="40"
                              fill={areaData.color}
                              opacity={areaData.opacity}
                            />
                          </>
                        )}
                        
                        {areaData.area_name === 'Coreto' && (
                          <>
                            <circle cx="220" cy="80" r="25" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="2" />
                            <text x="220" y="85" textAnchor="middle" className="text-xs fill-gray-700">Coreto</text>
                            <circle 
                              cx="220" cy="80" r="25"
                              fill={areaData.color}
                              opacity={areaData.opacity}
                            />
                          </>
                        )}
                        
                        {areaData.area_name === 'Bancos Norte' && (
                          <>
                            <rect x="60" y="190" width="80" height="20" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="1" rx="10" />
                            <rect x="160" y="190" width="80" height="20" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="1" rx="10" />
                            <text x="120" y="205" textAnchor="middle" className="text-xs fill-gray-700">Bancos Norte</text>
                            <rect 
                              x="60" y="190" width="180" height="20"
                              fill={areaData.color}
                              opacity={areaData.opacity}
                              rx="10"
                            />
                          </>
                        )}
                        
                        {areaData.area_name === 'Bancos Sul' && (
                          <>
                            <rect x="60" y="30" width="80" height="20" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="1" rx="10" />
                            <rect x="160" y="30" width="80" height="20" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="1" rx="10" />
                            <text x="120" y="45" textAnchor="middle" className="text-xs fill-gray-700">Bancos Sul</text>
                            <rect 
                              x="60" y="30" width="180" height="20"
                              fill={areaData.color}
                              opacity={areaData.opacity}
                              rx="10"
                            />
                          </>
                        )}
                        
                        {areaData.area_name === 'Caminhos' && (
                          <>
                            <path d="M 50 0 L 50 250" stroke="#d1d5db" strokeWidth="8" />
                            <path d="M 150 0 L 150 250" stroke="#d1d5db" strokeWidth="8" />
                            <path d="M 0 50 L 300 50" stroke="#d1d5db" strokeWidth="8" />
                            <path d="M 0 150 L 300 150" stroke="#d1d5db" strokeWidth="8" />
                            <rect 
                              x="0" y="0" width="300" height="250" 
                              fill={areaData.color}
                              opacity={areaData.opacity * 0.3}
                            />
                          </>
                        )}
                      </g>
                    )
                  })}
                  
                  {/* Sensores */}
                  <g>
                    <circle cx="100" cy="100" r="3" fill="#3b82f6" />
                    <circle cx="200" cy="100" r="3" fill="#3b82f6" />
                    <circle cx="100" cy="150" r="3" fill="#3b82f6" />
                    <circle cx="200" cy="150" r="3" fill="#3b82f6" />
                    <circle cx="150" cy="200" r="3" fill="#3b82f6" />
                    <circle cx="150" cy="50" r="3" fill="#3b82f6" />
                    <circle cx="250" cy="125" r="3" fill="#3b82f6" />
                    <circle cx="50" cy="125" r="3" fill="#3b82f6" />
                    <circle cx="220" cy="80" r="3" fill="#3b82f6" />
                    <circle cx="80" cy="80" r="3" fill="#3b82f6" />
                  </g>
                </svg>
                
                {/* Informações de hover */}
                <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg border">
                  <div className="text-sm space-y-1">
                    <div className="font-medium">Informações Atuais</div>
                    <div>Pessoas: {currentVisitors}</div>
                    <div>Última atualização: {formatLastUpdate()}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dados das Áreas */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes por Área</CardTitle>
          <CardDescription>Estatísticas detalhadas de cada área da praça</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {heatmapData.map((areaData) => (
              <div key={areaData.area_id} className="p-4 border rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div 
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: areaData.color }}
                  ></div>
                  <h3 className="font-medium">{areaData.area_name}</h3>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Pessoas:</span>
                    <span className="font-medium">{areaData.people_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Densidade:</span>
                    <span className="font-medium">{Math.round(areaData.density * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${areaData.density * 100}%`,
                        backgroundColor: areaData.color
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

