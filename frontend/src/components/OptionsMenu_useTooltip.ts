import { useEffect, useState } from 'react'

export default function useTooltip() {
  const [tooltipOpen, setTooltipOpen] = useState(false)

  useEffect(() => {
    let timeout: number | undefined
    if (localStorage.getItem('hideColumnsTooltip') === null) {
      const handleAnyClick = () => {
        localStorage.setItem('hideColumnsTooltip', 'true')
        setTooltipOpen(false)
        clearTimeout(timeout)
      }

      setTooltipOpen(true)

      timeout = setTimeout(() => {
        localStorage.setItem('hideColumnsTooltip', 'true')
        setTooltipOpen(false)
        document.removeEventListener('click', handleAnyClick)
        document.removeEventListener('touchstart', handleAnyClick)
      }, 5000)

      document.addEventListener('click', handleAnyClick)
      document.addEventListener('touchstart', handleAnyClick)

      return () => {
        clearTimeout(timeout)
        document.removeEventListener('click', handleAnyClick)
        document.removeEventListener('touchstart', handleAnyClick)
      }
    }
  }, [])

  return tooltipOpen
}
