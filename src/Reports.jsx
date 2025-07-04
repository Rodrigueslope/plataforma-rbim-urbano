import { useState, useEffect } from 'react'
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileSpreadsheet,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { reportsService } from '@/services/api'

export function Reports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [reportForm, setReportForm] = useState({
    title: '',
    report_type: 'daily',
    start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    file_format: 'pdf'
  })

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setLoading(true)
      const response = await reportsService.getReports()
      setReports(response.data || [])
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error)
      // Dados de demonstração em caso de erro
      setReports([
        {
          id: 1,
          title: 'Relatório Semanal - Praça da Independência',
          report_type: 'weekly',
          status: 'completed',
          file_format: 'pdf',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          title: 'Análise Mensal - Junho 2024',
          report_type: 'monthly',
          status: 'completed',
          file_format: 'excel',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 3,
          title: 'Relatório Diário - Ontem',
          report_type: 'daily',
          status: 'generating',
          file_format: 'pdf',
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async () => {
    try {
      setGenerating(true)
      
      const reportData = {
        ...reportForm,
        title: reportForm.title || `Relatório ${reportForm.report_type} - ${new Date().toLocaleDateString('pt-BR')}`
      }

      const response = await reportsService.generateReport(reportData)
      
      if (response.success) {
        await loadReports() // Recarrega a lista
        setReportForm({
          title: '',
          report_type: 'daily',
          start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0],
          file_format: 'pdf'
        })
        alert('Relatório gerado com sucesso!')
      } else {
        throw new Error(response.error || 'Erro ao gerar relatório')
      }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
      alert('Erro ao gerar relatório. Tente novamente.')
    } finally {
      setGenerating(false)
    }
  }

  const downloadReport = async (reportId, title, format) => {
    try {
      const response = await reportsService.downloadReport(reportId)
      
      // Cria um link temporário para download
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${title}.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao baixar relatório:', error)
      alert('Erro ao baixar relatório. Tente novamente.')
    }
  }

  const exportData = async (type, format) => {
    try {
      const exportData = {
        start_date: reportForm.start_date + 'T00:00:00Z',
        end_date: reportForm.end_date + 'T23:59:59Z',
        file_format: format
      }

      let response
      if (type === 'sensor') {
        response = await reportsService.exportSensorData(exportData)
      } else if (type === 'heatmap') {
        response = await reportsService.exportHeatmapData(exportData)
      }

      // Cria um link temporário para download
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${type}_data_${reportForm.start_date}_${reportForm.end_date}.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao exportar dados:', error)
      alert('Erro ao exportar dados. Tente novamente.')
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'generating':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      completed: 'default',
      generating: 'secondary',
      failed: 'destructive'
    }
    
    const labels = {
      completed: 'Concluído',
      generating: 'Gerando...',
      failed: 'Falhou'
    }

    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status}
      </Badge>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-600 mt-2">
          Gere e baixe relatórios detalhados sobre a análise urbana da Praça da Independência
        </p>
      </div>

      {/* Geração de Relatórios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Gerar Novo Relatório
          </CardTitle>
          <CardDescription>
            Configure os parâmetros para gerar um relatório personalizado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título (opcional)
              </label>
              <input
                type="text"
                value={reportForm.title}
                onChange={(e) => setReportForm({...reportForm, title: e.target.value})}
                placeholder="Título do relatório"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Relatório
              </label>
              <select
                value={reportForm.report_type}
                onChange={(e) => setReportForm({...reportForm, report_type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Diário</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Inicial
              </label>
              <input
                type="date"
                value={reportForm.start_date}
                onChange={(e) => setReportForm({...reportForm, start_date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Final
              </label>
              <input
                type="date"
                value={reportForm.end_date}
                onChange={(e) => setReportForm({...reportForm, end_date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Formato
              </label>
              <div className="flex gap-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="pdf"
                    checked={reportForm.file_format === 'pdf'}
                    onChange={(e) => setReportForm({...reportForm, file_format: e.target.value})}
                    className="mr-2"
                  />
                  PDF
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="excel"
                    checked={reportForm.file_format === 'excel'}
                    onChange={(e) => setReportForm({...reportForm, file_format: e.target.value})}
                    className="mr-2"
                  />
                  Excel
                </label>
              </div>
            </div>

            <div className="flex-1 flex justify-end">
              <Button 
                onClick={generateReport}
                disabled={generating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Gerar Relatório
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exportação Rápida */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportação Rápida de Dados
          </CardTitle>
          <CardDescription>
            Exporte dados brutos em formato CSV ou Excel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">Dados de Sensores</h4>
              <p className="text-sm text-gray-600">
                Dados brutos coletados pelos sensores IoT
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportData('sensor', 'csv')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportData('sensor', 'excel')}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Dados do Mapa de Calor</h4>
              <p className="text-sm text-gray-600">
                Dados processados de densidade e fluxo
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportData('heatmap', 'csv')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportData('heatmap', 'excel')}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Relatórios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Histórico de Relatórios
          </CardTitle>
          <CardDescription>
            Relatórios gerados anteriormente
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Carregando relatórios...
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum relatório encontrado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Formato</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      {report.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {report.report_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(report.status)}
                        {getStatusBadge(report.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {report.file_format?.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDate(report.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {report.status === 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadReport(report.id, report.title, report.file_format)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Baixar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

