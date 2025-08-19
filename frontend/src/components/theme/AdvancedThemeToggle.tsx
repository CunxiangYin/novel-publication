import { Monitor, Moon, Sun, BookOpen, Contrast, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/hooks/useTheme'
import type { ThemeMode, FontSize, FontFamily } from '@/hooks/useTheme'

const themeIcons: Record<ThemeMode, React.ReactNode> = {
  light: <Sun className="h-4 w-4" />,
  dark: <Moon className="h-4 w-4" />,
  sepia: <BookOpen className="h-4 w-4" />,
  'high-contrast': <Contrast className="h-4 w-4" />,
  system: <Monitor className="h-4 w-4" />
}

const themeModeLabels: Record<ThemeMode, string> = {
  light: '浅色模式',
  dark: '深色模式',
  sepia: '护眼模式',
  'high-contrast': '高对比度',
  system: '跟随系统'
}

const fontSizeLabels: Record<FontSize, string> = {
  small: '小',
  medium: '中',
  large: '大'
}

const fontFamilyLabels: Record<FontFamily, string> = {
  sans: '无衬线',
  serif: '衬线',
  mono: '等宽'
}

export function AdvancedThemeToggle() {
  const { theme, setThemeMode, setFontSize, setFontFamily, resetTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          {themeIcons[theme.mode]}
          <span className="sr-only">切换主题</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>主题设置</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Theme Mode */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Settings className="h-4 w-4 mr-2" />
            <span>主题模式</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {(Object.keys(themeIcons) as ThemeMode[]).map((mode) => (
              <DropdownMenuItem
                key={mode}
                onClick={() => setThemeMode(mode)}
                className={theme.mode === mode ? 'bg-accent' : ''}
              >
                <span className="mr-2">{themeIcons[mode]}</span>
                {themeModeLabels[mode]}
                {theme.mode === mode && (
                  <span className="ml-auto text-xs">✓</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Font Size */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <span className="h-4 w-4 mr-2 text-center font-bold">A</span>
            <span>字体大小</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {(['small', 'medium', 'large'] as FontSize[]).map((size) => (
              <DropdownMenuItem
                key={size}
                onClick={() => setFontSize(size)}
                className={theme.fontSize === size ? 'bg-accent' : ''}
              >
                <span 
                  className={`mr-2 font-bold ${
                    size === 'small' ? 'text-xs' : 
                    size === 'medium' ? 'text-sm' : 
                    'text-base'
                  }`}
                >
                  A
                </span>
                {fontSizeLabels[size]}
                {theme.fontSize === size && (
                  <span className="ml-auto text-xs">✓</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Font Family */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <span className="h-4 w-4 mr-2 text-center">T</span>
            <span>字体样式</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {(['sans', 'serif', 'mono'] as FontFamily[]).map((family) => (
              <DropdownMenuItem
                key={family}
                onClick={() => setFontFamily(family)}
                className={theme.fontFamily === family ? 'bg-accent' : ''}
              >
                <span 
                  className={`mr-2 ${
                    family === 'sans' ? 'font-sans' : 
                    family === 'serif' ? 'font-serif' : 
                    'font-mono'
                  }`}
                >
                  Aa
                </span>
                {fontFamilyLabels[family]}
                {theme.fontFamily === family && (
                  <span className="ml-auto text-xs">✓</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />
        
        {/* Reset */}
        <DropdownMenuItem onClick={resetTheme}>
          <span className="mr-2">↺</span>
          重置为默认
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}