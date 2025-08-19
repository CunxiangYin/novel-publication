import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./card"
import { LoadingSpinner } from "./loading-spinner"

// Chart data types
export interface ChartDataPoint {
  label: string
  value: number
  color?: string
  extra?: any
}

export interface TimeSeriesDataPoint {
  date: string | Date
  value: number
  label?: string
}

// Base chart props
interface BaseChartProps {
  className?: string
  loading?: boolean
  title?: string
  description?: string
  height?: number
  width?: number
  responsive?: boolean
}

// Line Chart Component
export interface LineChartProps extends BaseChartProps {
  data: TimeSeriesDataPoint[]
  xAxisKey?: string
  yAxisKey?: string
  strokeColor?: string
  strokeWidth?: number
  showDots?: boolean
  showGrid?: boolean
  animate?: boolean
}

const LineChart = ({
  data,
  className,
  loading = false,
  title,
  description,
  height = 300,
  strokeColor = "#3b82f6",
  strokeWidth = 2,
  showDots = true,
  showGrid = true,
  animate = true,
}: LineChartProps) => {
  const svgRef = React.useRef<SVGSVGElement>(null)
  const [dimensions, setDimensions] = React.useState({ width: 0, height })

  React.useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect()
        setDimensions({ width: rect.width, height })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [height])

  const createPath = (points: { x: number; y: number }[]) => {
    return points.reduce((path, point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`
      }
      return `${path} L ${point.x} ${point.y}`
    }, '')
  }

  const renderChart = () => {
    if (!data.length || dimensions.width === 0) return null

    const margin = { top: 20, right: 20, bottom: 40, left: 40 }
    const chartWidth = dimensions.width - margin.left - margin.right
    const chartHeight = dimensions.height - margin.top - margin.bottom

    const maxValue = Math.max(...data.map(d => d.value))
    const minValue = Math.min(...data.map(d => d.value))
    const valueRange = maxValue - minValue || 1

    const points = data.map((d, index) => ({
      x: margin.left + (index / (data.length - 1)) * chartWidth,
      y: margin.top + ((maxValue - d.value) / valueRange) * chartHeight,
    }))

    const pathData = createPath(points)

    return (
      <g>
        {/* Grid lines */}
        {showGrid && (
          <g className="opacity-20">
            {/* Horizontal grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
              <line
                key={`h-${ratio}`}
                x1={margin.left}
                x2={margin.left + chartWidth}
                y1={margin.top + ratio * chartHeight}
                y2={margin.top + ratio * chartHeight}
                stroke="currentColor"
                strokeWidth="1"
              />
            ))}
            {/* Vertical grid lines */}
            {points.map((point, index) => (
              <line
                key={`v-${index}`}
                x1={point.x}
                x2={point.x}
                y1={margin.top}
                y2={margin.top + chartHeight}
                stroke="currentColor"
                strokeWidth="1"
                opacity={index % 2 === 0 ? 1 : 0.5}
              />
            ))}
          </g>
        )}

        {/* Line path */}
        <path
          d={pathData}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          className={cn(animate && "animate-in fade-in duration-1000")}
        />

        {/* Data points */}
        {showDots && points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill={strokeColor}
              className={cn(
                "hover:r-6 transition-all cursor-pointer",
                animate && "animate-in zoom-in duration-500"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            />
            {/* Tooltip on hover */}
            <title>{`${data[index].label || data[index].date}: ${data[index].value}`}</title>
          </g>
        ))}

        {/* Y-axis labels */}
        {[maxValue, (maxValue + minValue) / 2, minValue].map((value, index) => (
          <text
            key={index}
            x={margin.left - 10}
            y={margin.top + (index * chartHeight) / 2}
            textAnchor="end"
            dominantBaseline="middle"
            className="text-xs fill-muted-foreground"
          >
            {value.toFixed(0)}
          </text>
        ))}
      </g>
    )
  }

  const content = loading ? (
    <div className="flex items-center justify-center" style={{ height }}>
      <LoadingSpinner />
    </div>
  ) : (
    <svg
      ref={svgRef}
      className="w-full"
      style={{ height }}
      viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
    >
      {renderChart()}
    </svg>
  )

  if (title || description) {
    return (
      <Card className={className}>
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>{content}</CardContent>
      </Card>
    )
  }

  return <div className={className}>{content}</div>
}

// Bar Chart Component
export interface BarChartProps extends BaseChartProps {
  data: ChartDataPoint[]
  horizontal?: boolean
  showValues?: boolean
  barColor?: string
  animate?: boolean
}

const BarChart = ({
  data,
  className,
  loading = false,
  title,
  description,
  height = 300,
  horizontal = false,
  showValues = true,
  barColor = "#3b82f6",
  animate = true,
}: BarChartProps) => {
  const svgRef = React.useRef<SVGSVGElement>(null)
  const [dimensions, setDimensions] = React.useState({ width: 0, height })

  React.useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect()
        setDimensions({ width: rect.width, height })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [height])

  const renderChart = () => {
    if (!data.length || dimensions.width === 0) return null

    const margin = { top: 20, right: 20, bottom: 60, left: 60 }
    const chartWidth = dimensions.width - margin.left - margin.right
    const chartHeight = dimensions.height - margin.top - margin.bottom

    const maxValue = Math.max(...data.map(d => d.value))
    const barWidth = horizontal ? chartHeight / data.length : chartWidth / data.length
    const barSpacing = barWidth * 0.1

    return (
      <g>
        {data.map((d, index) => {
          const barLength = horizontal
            ? (d.value / maxValue) * chartWidth
            : (d.value / maxValue) * chartHeight

          const barX = horizontal
            ? margin.left
            : margin.left + index * barWidth + barSpacing / 2

          const barY = horizontal
            ? margin.top + index * barWidth + barSpacing / 2
            : margin.top + chartHeight - barLength

          const barWidthActual = barWidth - barSpacing
          const barHeightActual = horizontal ? barWidthActual : barLength

          return (
            <g key={index}>
              {/* Bar */}
              <rect
                x={barX}
                y={barY}
                width={horizontal ? barLength : barWidthActual}
                height={barHeightActual}
                fill={d.color || barColor}
                className={cn(
                  "hover:opacity-80 cursor-pointer transition-opacity",
                  animate && "animate-in slide-in-from-bottom duration-500"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              />

              {/* Value label */}
              {showValues && (
                <text
                  x={horizontal 
                    ? barX + barLength + 5 
                    : barX + barWidthActual / 2
                  }
                  y={horizontal 
                    ? barY + barHeightActual / 2 
                    : barY - 5
                  }
                  textAnchor={horizontal ? "start" : "middle"}
                  dominantBaseline={horizontal ? "middle" : "auto"}
                  className="text-xs fill-muted-foreground"
                >
                  {d.value}
                </text>
              )}

              {/* Label */}
              <text
                x={horizontal 
                  ? margin.left - 5 
                  : barX + barWidthActual / 2
                }
                y={horizontal 
                  ? barY + barHeightActual / 2 
                  : dimensions.height - margin.bottom + 15
                }
                textAnchor={horizontal ? "end" : "middle"}
                dominantBaseline={horizontal ? "middle" : "auto"}
                className="text-xs fill-foreground"
                transform={horizontal 
                  ? undefined 
                  : `rotate(-45 ${barX + barWidthActual / 2} ${dimensions.height - margin.bottom + 15})`
                }
              >
                {d.label}
              </text>

              {/* Tooltip */}
              <title>{`${d.label}: ${d.value}`}</title>
            </g>
          )
        })}
      </g>
    )
  }

  const content = loading ? (
    <div className="flex items-center justify-center" style={{ height }}>
      <LoadingSpinner />
    </div>
  ) : (
    <svg
      ref={svgRef}
      className="w-full"
      style={{ height }}
      viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
    >
      {renderChart()}
    </svg>
  )

  if (title || description) {
    return (
      <Card className={className}>
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>{content}</CardContent>
      </Card>
    )
  }

  return <div className={className}>{content}</div>
}

// Pie Chart Component
export interface PieChartProps extends BaseChartProps {
  data: ChartDataPoint[]
  showLabels?: boolean
  showLegend?: boolean
  donutMode?: boolean
  animate?: boolean
}

const PieChart = ({
  data,
  className,
  loading = false,
  title,
  description,
  height = 300,
  showLabels = true,
  showLegend = true,
  donutMode = false,
  animate = true,
}: PieChartProps) => {
  const svgRef = React.useRef<SVGSVGElement>(null)
  const [dimensions, setDimensions] = React.useState({ width: 0, height })

  React.useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect()
        setDimensions({ width: rect.width, height })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [height])

  const colors = [
    "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
    "#06b6d4", "#84cc16", "#f97316", "#ec4899", "#6366f1"
  ]

  const createArcPath = (
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    innerRadius = 0
  ) => {
    const x1 = centerX + radius * Math.cos(startAngle)
    const y1 = centerY + radius * Math.sin(startAngle)
    const x2 = centerX + radius * Math.cos(endAngle)
    const y2 = centerY + radius * Math.sin(endAngle)

    const x3 = centerX + innerRadius * Math.cos(endAngle)
    const y3 = centerY + innerRadius * Math.sin(endAngle)
    const x4 = centerX + innerRadius * Math.cos(startAngle)
    const y4 = centerY + innerRadius * Math.sin(startAngle)

    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0

    if (innerRadius === 0) {
      return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`
    } else {
      return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`
    }
  }

  const renderChart = () => {
    if (!data.length || dimensions.width === 0) return null

    const centerX = dimensions.width / 2
    const centerY = dimensions.height / 2
    const radius = Math.min(centerX, centerY) - 40
    const innerRadius = donutMode ? radius * 0.6 : 0

    const total = data.reduce((sum, d) => sum + d.value, 0)
    let currentAngle = -Math.PI / 2

    const slices = data.map((d, index) => {
      const angle = (d.value / total) * 2 * Math.PI
      const startAngle = currentAngle
      const endAngle = currentAngle + angle
      currentAngle = endAngle

      const midAngle = (startAngle + endAngle) / 2
      const labelX = centerX + (radius + 20) * Math.cos(midAngle)
      const labelY = centerY + (radius + 20) * Math.sin(midAngle)

      return {
        ...d,
        startAngle,
        endAngle,
        midAngle,
        labelX,
        labelY,
        color: d.color || colors[index % colors.length],
        percentage: ((d.value / total) * 100).toFixed(1),
      }
    })

    return (
      <g>
        {slices.map((slice, index) => (
          <g key={index}>
            {/* Slice */}
            <path
              d={createArcPath(centerX, centerY, radius, slice.startAngle, slice.endAngle, innerRadius)}
              fill={slice.color}
              className={cn(
                "hover:opacity-80 cursor-pointer transition-opacity",
                animate && "animate-in fade-in duration-500"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            />

            {/* Label */}
            {showLabels && slice.value > total * 0.05 && (
              <text
                x={slice.labelX}
                y={slice.labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs fill-foreground"
              >
                {slice.percentage}%
              </text>
            )}

            {/* Tooltip */}
            <title>{`${slice.label}: ${slice.value} (${slice.percentage}%)`}</title>
          </g>
        ))}

        {/* Center label for donut */}
        {donutMode && (
          <g>
            <text
              x={centerX}
              y={centerY - 5}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-lg font-semibold fill-foreground"
            >
              {total}
            </text>
            <text
              x={centerX}
              y={centerY + 15}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs fill-muted-foreground"
            >
              总计
            </text>
          </g>
        )}
      </g>
    )
  }

  const renderLegend = () => {
    if (!showLegend || !data.length) return null

    return (
      <div className="flex flex-wrap gap-2 mt-4">
        {data.map((d, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: d.color || colors[index % colors.length] }}
            />
            <span>{d.label}</span>
          </div>
        ))}
      </div>
    )
  }

  const content = loading ? (
    <div className="flex items-center justify-center" style={{ height }}>
      <LoadingSpinner />
    </div>
  ) : (
    <>
      <svg
        ref={svgRef}
        className="w-full"
        style={{ height }}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
      >
        {renderChart()}
      </svg>
      {renderLegend()}
    </>
  )

  if (title || description) {
    return (
      <Card className={className}>
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>{content}</CardContent>
      </Card>
    )
  }

  return <div className={className}>{content}</div>
}

// Analytics Dashboard Component
export interface AnalyticsDashboardProps {
  data: {
    lineChart?: TimeSeriesDataPoint[]
    barChart?: ChartDataPoint[]
    pieChart?: ChartDataPoint[]
  }
  loading?: boolean
  className?: string
}

const AnalyticsDashboard = ({
  data,
  loading = false,
  className,
}: AnalyticsDashboardProps) => {
  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-6", className)}>
      {data.lineChart && (
        <LineChart
          data={data.lineChart}
          title="趋势分析"
          description="数据随时间变化趋势"
          loading={loading}
        />
      )}
      
      {data.barChart && (
        <BarChart
          data={data.barChart}
          title="对比分析"
          description="各项数据对比"
          loading={loading}
        />
      )}
      
      {data.pieChart && (
        <div className="lg:col-span-2">
          <PieChart
            data={data.pieChart}
            title="分布分析"
            description="数据分布情况"
            donutMode
            loading={loading}
          />
        </div>
      )}
    </div>
  )
}

export {
  LineChart,
  BarChart,
  PieChart,
  AnalyticsDashboard,
}