import { useState } from 'react'
import { 
  Settings as SettingsIcon, 
  Wifi, 
  Bell, 
  Shield, 
  Database,
  Users,
  MapPin,
  Clock,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'

export function Settings() {
  const [settings, setSettings] = useState({
    notifications: {
      realTimeAlerts: true,
      emailReports: false,
      smsAlerts: false,
      highDensityThreshold: 80,
      lowActivityThreshold: 5
    },
    sensors: {
      autoCalibration: true,
      dataRetention: 90,
      samplingInterval: 5,
      batteryAlerts: true
    },
    system: {
      autoBackup: true,
      backupFrequency: 'daily',
      maintenanceMode: false,
      debugMode: false
    },
    display: {
      refreshInterval: 30,
      heatmapOpacity: 70,
      showSensorLocations: true,
      darkMode: false
    }
  })

  const [isSaving, setIsSaving] = useState(false)

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }

  const saveSettings = async () => {
    setIsSaving(true)
    
    // Simula salvamento das configurações
    try {
      // Em produção, isso seria uma chamada real para a API
      // await fetch('http://localhost:5000/api/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings)
      // })
      
      setTimeout(() => {
        setIsSaving(false)
        alert('Configurações salvas com sucesso!')
      }, 1500)
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      setIsSaving(false)
    }
  }

  const resetToDefaults = () => {
    if (confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
      // Restaura configurações padrão
      setSettings({
        notifications: {
          realTimeAlerts: true,
          emailReports: false,
          smsAlerts: false,
          highDensityThreshold: 80,
          lowActivityThreshold: 5
        },
        sensors: {
          autoCalibration: true,
          dataRetention: 90,
          samplingInterval: 5,
          batteryAlerts: true
        },
        system: {
          autoBackup: true,
          backupFrequency: 'daily',
          maintenanceMode: false,
          debugMode: false
        },
        display: {
          refreshInterval: 30,
          heatmapOpacity: 70,
          showSensorLocations: true,
          darkMode: false
        }
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600">Gerencie as configurações da plataforma de análise urbana</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={resetToDefaults}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Restaurar Padrão
          </Button>
          <Button onClick={saveSettings} disabled={isSaving}>
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="sensors">Sensores</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="display">Exibição</TabsTrigger>
        </TabsList>

        {/* Notificações */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Configurações de Notificações
              </CardTitle>
              <CardDescription>Configure como e quando receber alertas do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Alertas em Tempo Real</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba notificações instantâneas sobre eventos importantes
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.realTimeAlerts}
                    onCheckedChange={(value) => updateSetting('notifications', 'realTimeAlerts', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Relatórios por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Envie relatórios automáticos por email
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.emailReports}
                    onCheckedChange={(value) => updateSetting('notifications', 'emailReports', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Alertas por SMS</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba alertas críticos via SMS
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.smsAlerts}
                    onCheckedChange={(value) => updateSetting('notifications', 'smsAlerts', value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Limite de Alta Densidade (%)</Label>
                  <div className="px-3">
                    <Slider
                      value={[settings.notifications.highDensityThreshold]}
                      onValueChange={([value]) => updateSetting('notifications', 'highDensityThreshold', value)}
                      max={100}
                      min={50}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>50%</span>
                      <span>{settings.notifications.highDensityThreshold}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Limite de Baixa Atividade (pessoas)</Label>
                  <div className="px-3">
                    <Slider
                      value={[settings.notifications.lowActivityThreshold]}
                      onValueChange={([value]) => updateSetting('notifications', 'lowActivityThreshold', value)}
                      max={20}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>1</span>
                      <span>{settings.notifications.lowActivityThreshold} pessoas</span>
                      <span>20</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sensores */}
        <TabsContent value="sensors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wifi className="h-5 w-5 mr-2" />
                Configurações dos Sensores
              </CardTitle>
              <CardDescription>Gerencie o comportamento e configurações dos sensores IoT</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Calibração Automática</Label>
                    <p className="text-sm text-muted-foreground">
                      Permite que os sensores se calibrem automaticamente
                    </p>
                  </div>
                  <Switch
                    checked={settings.sensors.autoCalibration}
                    onCheckedChange={(value) => updateSetting('sensors', 'autoCalibration', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Alertas de Bateria</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificar quando a bateria dos sensores estiver baixa
                    </p>
                  </div>
                  <Switch
                    checked={settings.sensors.batteryAlerts}
                    onCheckedChange={(value) => updateSetting('sensors', 'batteryAlerts', value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="retention">Retenção de Dados (dias)</Label>
                  <Input
                    id="retention"
                    type="number"
                    value={settings.sensors.dataRetention}
                    onChange={(e) => updateSetting('sensors', 'dataRetention', parseInt(e.target.value))}
                    min="30"
                    max="365"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sampling">Intervalo de Amostragem (minutos)</Label>
                  <Select
                    value={settings.sensors.samplingInterval.toString()}
                    onValueChange={(value) => updateSetting('sensors', 'samplingInterval', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 minuto</SelectItem>
                      <SelectItem value="5">5 minutos</SelectItem>
                      <SelectItem value="10">10 minutos</SelectItem>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status dos Sensores */}
          <Card>
            <CardHeader>
              <CardTitle>Status dos Sensores</CardTitle>
              <CardDescription>Monitoramento em tempo real dos sensores instalados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sensorId) => (
                  <div key={sensorId} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Sensor {sensorId}</h4>
                      <Badge variant="outline" className="text-green-700 border-green-300">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Ativo
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>Bateria: 85%</div>
                      <div>Última leitura: 2 min atrás</div>
                      <div>Localização: Área {Math.ceil(sensorId / 2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sistema */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Configurações do Sistema
              </CardTitle>
              <CardDescription>Configurações gerais de funcionamento da plataforma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Backup Automático</Label>
                    <p className="text-sm text-muted-foreground">
                      Realizar backup automático dos dados
                    </p>
                  </div>
                  <Switch
                    checked={settings.system.autoBackup}
                    onCheckedChange={(value) => updateSetting('system', 'autoBackup', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Modo de Manutenção</Label>
                    <p className="text-sm text-muted-foreground">
                      Ativar modo de manutenção do sistema
                    </p>
                  </div>
                  <Switch
                    checked={settings.system.maintenanceMode}
                    onCheckedChange={(value) => updateSetting('system', 'maintenanceMode', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Modo Debug</Label>
                    <p className="text-sm text-muted-foreground">
                      Ativar logs detalhados para depuração
                    </p>
                  </div>
                  <Switch
                    checked={settings.system.debugMode}
                    onCheckedChange={(value) => updateSetting('system', 'debugMode', value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backup-frequency">Frequência de Backup</Label>
                <Select
                  value={settings.system.backupFrequency}
                  onValueChange={(value) => updateSetting('system', 'backupFrequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">A cada hora</SelectItem>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exibição */}
        <TabsContent value="display" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Configurações de Exibição
              </CardTitle>
              <CardDescription>Personalize a aparência e comportamento da interface</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Mostrar Localização dos Sensores</Label>
                    <p className="text-sm text-muted-foreground">
                      Exibir ícones dos sensores no mapa de calor
                    </p>
                  </div>
                  <Switch
                    checked={settings.display.showSensorLocations}
                    onCheckedChange={(value) => updateSetting('display', 'showSensorLocations', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Modo Escuro</Label>
                    <p className="text-sm text-muted-foreground">
                      Usar tema escuro na interface
                    </p>
                  </div>
                  <Switch
                    checked={settings.display.darkMode}
                    onCheckedChange={(value) => updateSetting('display', 'darkMode', value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Intervalo de Atualização (segundos)</Label>
                  <div className="px-3">
                    <Slider
                      value={[settings.display.refreshInterval]}
                      onValueChange={([value]) => updateSetting('display', 'refreshInterval', value)}
                      max={120}
                      min={10}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>10s</span>
                      <span>{settings.display.refreshInterval}s</span>
                      <span>120s</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Opacidade do Mapa de Calor (%)</Label>
                  <div className="px-3">
                    <Slider
                      value={[settings.display.heatmapOpacity]}
                      onValueChange={([value]) => updateSetting('display', 'heatmapOpacity', value)}
                      max={100}
                      min={30}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>30%</span>
                      <span>{settings.display.heatmapOpacity}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

