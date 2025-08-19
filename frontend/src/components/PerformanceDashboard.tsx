import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { LineChart, BarChart, PieChart } from '@/components/ui/chart'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { 
  Activity, 
  Zap, 
  Database, 
  Wifi, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'
import { usePerformanceOptimization } from '@/hooks/usePerformance'
import { CacheManager } from '@/utils/cache'
import { api } from '@/services/optimizedApi'

interface PerformanceDashboardProps {
  className?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  className,
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds
}) => {
  const {
    renderMetrics,
    memoryInfo,
    bundleInfo,
    networkMetrics,
    webVitals,
    performanceScore,
    recommendations,
  } = usePerformanceOptimization('PerformanceDashboard')

  const [cacheStats, setCacheStats] = useState<any>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([])

  // Refresh all performance data
  const refreshData = async () => {
    setIsRefreshing(true)
    
    try {
      // Get cache statistics
      const stats = CacheManager.getGlobalStats()
      setCacheStats(stats)
      
      // Update time series data
      setTimeSeriesData(prev => [
        ...prev.slice(-19), // Keep last 19 data points
        {
          date: new Date().toLocaleTimeString(),
          value: performanceScore,
          label: `Score: ${performanceScore}`,
        }
      ])
    } catch (error) {
      console.error('Failed to refresh performance data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Auto refresh
  useEffect(() => {
    refreshData()
    
    if (autoRefresh) {
      const interval = setInterval(refreshData, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval, performanceScore])

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default'
    if (score >= 70) return 'secondary'
    return 'destructive'
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Performance Score */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className={`text-2xl font-bold ${getScoreColor(performanceScore)}`}>
              {performanceScore}
            </div>
            <Badge variant={getScoreBadgeVariant(performanceScore)}>
              {performanceScore >= 90 ? 'Excellent' : performanceScore >= 70 ? 'Good' : 'Poor'}
            </Badge>
          </div>
          <Progress value={performanceScore} className="mt-2" />
        </CardContent>
      </Card>

      {/* Render Performance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Render Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {renderMetrics.renderTime}ms
          </div>
          <p className="text-xs text-muted-foreground">
            {renderMetrics.rerenderCount} rerenders
          </p>
        </CardContent>
      </Card>

      {/* Memory Usage */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {memoryInfo ? formatBytes(memoryInfo.usedJSHeapSize) : 'N/A'}
          </div>
          <p className="text-xs text-muted-foreground">
            {memoryInfo ? `${Math.round((memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize) * 100)}% used` : 'Unavailable'}
          </p>
        </CardContent>
      </Card>

      {/* Network Performance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Network</CardTitle>
          <Wifi className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round(networkMetrics.averageLatency)}ms
          </div>
          <p className="text-xs text-muted-foreground">
            {networkMetrics.requestCount} requests
          </p>
        </CardContent>
      </Card>
    </div>
  )

  const renderWebVitals = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">First Contentful Paint</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{Math.round(webVitals.fcp)}ms</span>
            {webVitals.fcp <= 1800 ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            )}
          </div>
          <Progress 
            value={Math.min(100, (webVitals.fcp / 3000) * 100)} 
            className="mt-2"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Largest Contentful Paint</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{Math.round(webVitals.lcp)}ms</span>
            {webVitals.lcp <= 2500 ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            )}
          </div>
          <Progress 
            value={Math.min(100, (webVitals.lcp / 4000) * 100)} 
            className="mt-2"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">First Input Delay</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{Math.round(webVitals.fid)}ms</span>
            {webVitals.fid <= 100 ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            )}
          </div>
          <Progress 
            value={Math.min(100, (webVitals.fid / 300) * 100)} 
            className="mt-2"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Cumulative Layout Shift</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{webVitals.cls.toFixed(3)}</span>
            {webVitals.cls <= 0.1 ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            )}
          </div>
          <Progress 
            value={Math.min(100, (webVitals.cls / 0.25) * 100)} 
            className="mt-2"
          />
        </CardContent>
      </Card>
    </div>
  )

  const renderCacheStats = () => {
    if (!cacheStats) return <LoadingSpinner />

    const chartData = cacheStats.caches.map((cache: any) => ({
      label: cache.name,
      value: cache.size,
      color: cache.hitRate > 0.8 ? '#10b981' : cache.hitRate > 0.6 ? '#f59e0b' : '#ef4444',
    }))

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Total Cached Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cacheStats.totalSize}</div>
              <p className="text-xs text-muted-foreground">
                {cacheStats.totalCaches} caches
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Memory Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatBytes(cacheStats.totalMemoryUsage)}
              </div>
              <p className="text-xs text-muted-foreground">
                Cache storage
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Average Hit Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(cacheStats.averageHitRate * 100)}%
              </div>
              <Progress 
                value={cacheStats.averageHitRate * 100} 
                className="mt-2"
              />
            </CardContent>
          </Card>
        </div>

        <PieChart
          data={chartData}
          title="Cache Distribution"
          description="Number of items in each cache"
          height={300}
        />
      </div>
    )
  }

  const renderRecommendations = () => (
    <div className="space-y-4">
      {recommendations.length === 0 ? (
        <Card>
          <CardContent className="flex items-center space-x-2 pt-6">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>No performance issues detected! Your app is running optimally.</span>
          </CardContent>
        </Card>
      ) : (
        recommendations.map((rec, index) => (
          <Card key={index}>
            <CardContent className="flex items-start space-x-2 pt-6">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="font-medium">Performance Recommendation</p>
                <p className="text-sm text-muted-foreground mt-1">{rec}</p>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Performance Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor and optimize your application's performance
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshData}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <LoadingSpinner size="sm" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vitals">Web Vitals</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="vitals" className="space-y-4">
          {renderWebVitals()}
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          {renderCacheStats()}
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {timeSeriesData.length > 0 ? (
            <LineChart
              data={timeSeriesData}
              title="Performance Score Trend"
              description="Performance score over time"
              height={400}
            />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">
                  No trend data available yet. Data will appear after a few refresh cycles.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {renderRecommendations()}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default PerformanceDashboard