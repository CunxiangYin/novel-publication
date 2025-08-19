import { useState, useEffect } from 'react'

// 导出所有类型定义
export type ThemeMode = 'light' | 'dark' | 'sepia' | 'high-contrast' | 'system'
export type FontSize = 'small' | 'medium' | 'large'
export type FontFamily = 'sans' | 'serif' | 'mono'

interface ThemeConfig {
  mode: ThemeMode
  fontSize: FontSize
  fontFamily: FontFamily
  customColors?: Record<string, string>
}

const THEME_STORAGE_KEY = 'novel-publication-theme'

const defaultTheme: ThemeConfig = {
  mode: 'system',
  fontSize: 'medium',
  fontFamily: 'sans'
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeConfig>(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return defaultTheme
      }
    }
    return defaultTheme
  })

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement
    
    // Remove all theme classes
    root.classList.remove('light', 'dark', 'sepia', 'high-contrast')
    
    // Apply theme mode
    let effectiveMode = theme.mode
    if (theme.mode === 'system') {
      effectiveMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    root.classList.add(effectiveMode)
    
    // Apply font size
    root.setAttribute('data-font-size', theme.fontSize)
    
    // Apply font family
    root.setAttribute('data-font-family', theme.fontFamily)
    
    // Apply custom colors if any
    if (theme.customColors) {
      Object.entries(theme.customColors).forEach(([key, value]) => {
        root.style.setProperty(`--custom-${key}`, value)
      })
    }
  }, [theme])

  // Listen for system theme changes
  useEffect(() => {
    if (theme.mode !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      setThemeState(prev => ({ ...prev }))
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme.mode])

  // Save theme to localStorage
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme))
  }, [theme])

  const setTheme = (updates: Partial<ThemeConfig>) => {
    setThemeState(prev => ({ ...prev, ...updates }))
  }

  const setThemeMode = (mode: ThemeMode) => setTheme({ mode })
  const setFontSize = (fontSize: FontSize) => setTheme({ fontSize })
  const setFontFamily = (fontFamily: FontFamily) => setTheme({ fontFamily })
  const setCustomColors = (customColors: Record<string, string>) => setTheme({ customColors })

  const resetTheme = () => {
    setThemeState(defaultTheme)
  }

  return {
    theme,
    setTheme,
    setThemeMode,
    setFontSize,
    setFontFamily,
    setCustomColors,
    resetTheme
  }
}

// 确保类型被导出
export type { ThemeConfig }