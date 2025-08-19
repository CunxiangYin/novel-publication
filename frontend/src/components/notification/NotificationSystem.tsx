import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { 
  X, CheckCircle, AlertCircle, Info, AlertTriangle,
  Bell, BellOff, Settings, Trash2, Archive
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

// 通知类型
export type NotificationType = 'success' | 'error' | 'warning' | 'info'
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent'

// 通知接口
export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  priority?: NotificationPriority
  persistent?: boolean
  actions?: NotificationAction[]
  timestamp: Date
  read?: boolean
  category?: string
  metadata?: Record<string, any>
  duration?: number // 自动关闭时间（毫秒）
}

// 通知动作
export interface NotificationAction {
  label: string
  action: () => void
  variant?: 'default' | 'destructive' | 'outline' | 'secondary'
}

// 通知配置
export interface NotificationConfig {
  maxNotifications?: number
  defaultDuration?: number
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  enableSound?: boolean
  enablePersistence?: boolean
  enableGrouping?: boolean
}

// 通知上下文
interface NotificationContextType {
  notifications: Notification[]
  config: NotificationConfig
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => string
  removeNotification: (id: string) => void
  clearAll: () => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  updateConfig: (config: Partial<NotificationConfig>) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

// 通知提供者
export function NotificationProvider({ 
  children,
  defaultConfig = {}
}: { 
  children: React.ReactNode
  defaultConfig?: NotificationConfig 
}) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    // 从 localStorage 恢复持久化通知
    const saved = localStorage.getItem('notifications')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return parsed.filter((n: Notification) => n.persistent)
      } catch {
        return []
      }
    }
    return []
  })

  const [config, setConfig] = useState<NotificationConfig>({
    maxNotifications: 5,
    defaultDuration: 5000,
    position: 'top-right',
    enableSound: true,
    enablePersistence: true,
    enableGrouping: true,
    ...defaultConfig
  })

  // 添加通知
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = `notification-${Date.now()}-${Math.random()}`
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      duration: notification.duration ?? config.defaultDuration
    }

    setNotifications(prev => {
      const updated = [newNotification, ...prev]
      
      // 限制最大通知数
      if (config.maxNotifications && updated.length > config.maxNotifications) {
        // 移除最旧的非持久化通知
        const nonPersistent = updated.filter(n => !n.persistent)
        const persistent = updated.filter(n => n.persistent)
        
        if (nonPersistent.length > config.maxNotifications) {
          return [...persistent, ...nonPersistent.slice(0, config.maxNotifications - persistent.length)]
        }
      }
      
      return updated
    })

    // 播放声音
    if (config.enableSound && notification.type === 'error') {
      playNotificationSound()
    }

    // 自动移除非持久化通知
    if (!notification.persistent && notification.duration) {
      setTimeout(() => {
        removeNotification(id)
      }, notification.duration)
    }

    return id
  }, [config])

  // 移除通知
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  // 清空所有通知
  const clearAll = useCallback(() => {
    setNotifications(prev => prev.filter(n => n.persistent))
  }, [])

  // 标记为已读
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }, [])

  // 标记全部为已读
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  // 更新配置
  const updateConfig = useCallback((newConfig: Partial<NotificationConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }))
  }, [])

  // 持久化通知
  useEffect(() => {
    if (config.enablePersistence) {
      const persistent = notifications.filter(n => n.persistent)
      localStorage.setItem('notifications', JSON.stringify(persistent))
    }
  }, [notifications, config.enablePersistence])

  return (
    <NotificationContext.Provider value={{
      notifications,
      config,
      addNotification,
      removeNotification,
      clearAll,
      markAsRead,
      markAllAsRead,
      updateConfig
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  )
}

// 使用通知 Hook
export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return context
}

// 通知容器组件
function NotificationContainer() {
  const { notifications, config, removeNotification, markAsRead } = useNotification()
  const [isExpanded, setIsExpanded] = useState(false)
  
  // 分组通知
  const groupedNotifications = config.enableGrouping 
    ? notifications.reduce((acc, notification) => {
        const category = notification.category || 'default'
        if (!acc[category]) acc[category] = []
        acc[category].push(notification)
        return acc
      }, {} as Record<string, Notification[]>)
    : { default: notifications }

  // 位置样式
  const positionStyles = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <>
      {/* 通知弹出层 */}
      <div className={cn(
        'fixed z-50 pointer-events-none',
        positionStyles[config.position || 'top-right']
      )}>
        <div className="pointer-events-auto space-y-2 max-w-sm">
          {notifications
            .filter(n => !n.persistent)
            .slice(0, 3)
            .map(notification => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onClose={() => removeNotification(notification.id)}
                onRead={() => markAsRead(notification.id)}
              />
            ))}
        </div>
      </div>

      {/* 通知中心按钮 */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </div>
      </Button>

      {/* 通知中心面板 */}
      {isExpanded && (
        <Card className="fixed bottom-20 right-4 z-50 w-96 max-h-[600px] shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">通知中心</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAllAsRead()}
                  disabled={unreadCount === 0}
                >
                  全部已读
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearAll()}
                  disabled={notifications.length === 0}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <BellOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>暂无通知</p>
                </div>
              ) : (
                <div className="p-4 space-y-2">
                  {Object.entries(groupedNotifications).map(([category, items]) => (
                    <div key={category} className="space-y-2">
                      {category !== 'default' && (
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2">
                          {category}
                        </div>
                      )}
                      {items.map(notification => (
                        <NotificationCard
                          key={notification.id}
                          notification={notification}
                          onClose={() => removeNotification(notification.id)}
                          onRead={() => markAsRead(notification.id)}
                          compact
                        />
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </>
  )
}

// 通知卡片组件
function NotificationCard({ 
  notification, 
  onClose, 
  onRead,
  compact = false 
}: { 
  notification: Notification
  onClose: () => void
  onRead: () => void
  compact?: boolean
}) {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />
  }

  const priorityColors = {
    low: 'bg-gray-100',
    medium: 'bg-blue-100',
    high: 'bg-orange-100',
    urgent: 'bg-red-100'
  }

  useEffect(() => {
    if (!notification.read) {
      onRead()
    }
  }, [notification.read, onRead])

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all',
      'hover:shadow-lg',
      !notification.read && 'border-primary',
      notification.priority && priorityColors[notification.priority],
      compact && 'p-2',
      'animate-in slide-in-from-right fade-in duration-300'
    )}>
      <CardContent className={cn('flex gap-3', compact ? 'p-2' : 'p-4')}>
        <div className="flex-shrink-0">
          {icons[notification.type]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className={cn('font-medium', compact && 'text-sm')}>
                {notification.title}
              </p>
              {notification.message && (
                <p className={cn('text-muted-foreground mt-1', compact && 'text-xs')}>
                  {notification.message}
                </p>
              )}
              {notification.actions && notification.actions.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {notification.actions.map((action, index) => (
                    <Button
                      key={index}
                      variant={action.variant || 'outline'}
                      size="sm"
                      onClick={action.action}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground">
              {formatTime(notification.timestamp)}
            </span>
            {notification.persistent && (
              <Badge variant="outline" className="text-xs">
                持久
              </Badge>
            )}
            {notification.priority && notification.priority !== 'medium' && (
              <Badge variant="outline" className="text-xs">
                {notification.priority}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 工具函数
function formatTime(date: Date) {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}天前`
  if (hours > 0) return `${hours}小时前`
  if (minutes > 0) return `${minutes}分钟前`
  return '刚刚'
}

function playNotificationSound() {
  // 播放通知声音
  const audio = new Audio('data:audio/wav;base64,UklGRi...')
  audio.play().catch(() => {})
}