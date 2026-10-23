import React, { useEffect, useState } from 'react'
import { CheckCircle2, Info, AlertTriangle, X, Zap } from 'lucide-react'

export interface ToastItem {
  id: string
  title: string
  message: string
  type?: 'success' | 'info' | 'warning' | 'edge'
  duration?: number
}

interface ToastContainerProps {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <SingleToast key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  )
}

const SingleToast: React.FC<{ toast: ToastItem; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  const [progress, setProgress] = useState(100)
  const duration = toast.duration || 3500

  useEffect(() => {
    const start = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const remainingPct = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remainingPct)
      if (remainingPct <= 0) {
        clearInterval(timer)
        onDismiss()
      }
    }, 25)

    return () => clearInterval(timer)
  }, [duration, onDismiss])

  const getTheme = () => {
    switch (toast.type) {
      case 'edge':
        return {
          icon: <Zap className="w-4 h-4 text-[#00e599] shrink-0 animate-bounce" />,
          border: 'border-[#00e599]/50 shadow-[#00e599]/20',
          bg: 'bg-[#141a18]/95',
          progressBg: 'bg-[#00e599]',
          titleColor: 'text-[#00e599]'
        }
      case 'success':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-[#00e599] shrink-0" />,
          border: 'border-[#00e599]/40 shadow-emerald-500/10',
          bg: 'bg-[#181a1f]/95',
          progressBg: 'bg-[#00e599]',
          titleColor: 'text-white'
        }
      case 'warning':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-[#f59e0b] shrink-0" />,
          border: 'border-[#f59e0b]/40 shadow-amber-500/10',
          bg: 'bg-[#1c1815]/95',
          progressBg: 'bg-[#f59e0b]',
          titleColor: 'text-[#f59e0b]'
        }
      case 'info':
      default:
        return {
          icon: <Info className="w-4 h-4 text-[#38bdf8] shrink-0" />,
          border: 'border-[#38bdf8]/40 shadow-sky-500/10',
          bg: 'bg-[#181a1f]/95',
          progressBg: 'bg-[#38bdf8]',
          titleColor: 'text-white'
        }
    }
  }

  const theme = getTheme()

  return (
    <div
      className={`pointer-events-auto rounded-lg border ${theme.border} ${theme.bg} backdrop-blur-md p-3.5 shadow-2xl animate-slide-in-right relative overflow-hidden transition-all font-mono`}
    >
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5">{theme.icon}</div>
        <div className="flex-1 pr-2">
          <div className={`text-xs font-sans font-bold ${theme.titleColor}`}>
            {toast.title}
          </div>
          <div className="text-[11px] text-[#8b949e] font-sans mt-0.5 leading-snug">
            {toast.message}
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-[#8b949e] hover:text-white p-0.5 rounded hover:bg-[#252830] transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress Bar running at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#272b35]/60">
        <div
          className={`h-full ${theme.progressBg} transition-all duration-75`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
