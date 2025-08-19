import { useState } from 'react'
import { Upload, FileText, BookOpen, Settings, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

interface MobileNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  hasNovel: boolean
}

const navigationItems = [
  { id: 'upload', label: '上传', icon: Upload, requiresNovel: false },
  { id: 'edit', label: '编辑', icon: FileText, requiresNovel: true },
  { id: 'chapters', label: '章节', icon: BookOpen, requiresNovel: true },
  { id: 'settings', label: '设置', icon: Settings, requiresNovel: true },
]

export function MobileNavigation({ activeTab, onTabChange, hasNovel }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleNavClick = (id: string) => {
    onTabChange(id)
    setIsOpen(false)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-background/95 backdrop-blur">
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <nav className="flex flex-col gap-2 mt-8">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const disabled = item.requiresNovel && !hasNovel
                
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? 'default' : 'ghost'}
                    className={cn(
                      "justify-start",
                      disabled && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => !disabled && handleNavClick(item.id)}
                    disabled={disabled}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                )
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Bottom Navigation Bar for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur border-t">
        <nav className="flex justify-around py-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const disabled = item.requiresNovel && !hasNovel
            
            return (
              <button
                key={item.id}
                className={cn(
                  "flex flex-col items-center py-2 px-3 rounded-lg transition-colors",
                  activeTab === item.id 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => !disabled && onTabChange(item.id)}
                disabled={disabled}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </>
  )
}