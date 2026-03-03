'use client'

import { useEffect, useRef, useCallback } from 'react'
import { SCROLL_EXPAND_CONFIG } from './constants'
import gsap from 'gsap'

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function useScrollExpand(totalRows: number) {
  const sectionRef = useRef<HTMLElement>(null)
  const rowsRef = useRef<(HTMLDivElement | null)[]>([])
  const rowStartWidth = useRef(SCROLL_EXPAND_CONFIG.desktop.startWidth)
  const rowEndWidth = useRef(SCROLL_EXPAND_CONFIG.desktop.endWidth)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const rows = rowsRef.current.filter(Boolean) as HTMLDivElement[]
    if (rows.length === 0) return

    const sectionGap = parseFloat(getComputedStyle(section).gap) || 0
    const sectionPadding = parseFloat(getComputedStyle(section).paddingTop) || 0

    function recalculate() {
      const isMobile = window.innerWidth < SCROLL_EXPAND_CONFIG.mobileBreakpoint

      rowStartWidth.current = isMobile
        ? SCROLL_EXPAND_CONFIG.mobile.startWidth
        : SCROLL_EXPAND_CONFIG.desktop.startWidth

      rowEndWidth.current = isMobile
        ? SCROLL_EXPAND_CONFIG.mobile.endWidth
        : SCROLL_EXPAND_CONFIG.desktop.endWidth

      const firstRow = rows[0]
      firstRow.style.width = `${rowEndWidth.current}%`
      const expandedRowHeight = firstRow.offsetHeight
      firstRow.style.width = ''

      const expandedSectionHeight =
        expandedRowHeight * rows.length +
        sectionGap * (rows.length - 1) +
        sectionPadding * 2

      section.style.height = `${expandedSectionHeight}px`
    }

    recalculate()

    function onScrollUpdate() {
      const scrollY = window.scrollY
      const viewportHeight = window.innerHeight
      const startW = rowStartWidth.current
      const endW = rowEndWidth.current

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const rect = row.getBoundingClientRect()
        const rowTop = rect.top + scrollY
        const rowBottom = rowTop + rect.height

        const scrollStart = rowTop - viewportHeight
        const scrollEnd = rowBottom

        const progress = clamp(
          (scrollY - scrollStart) / (scrollEnd - scrollStart),
          0,
          1,
        )

        const width = startW + (endW - startW) * progress
        row.style.width = `${width}%`
      }
    }

    gsap.ticker.add(onScrollUpdate)

    const handleResize = () => {
      recalculate()
    }
    
    window.addEventListener('resize', handleResize)

    return () => {
      gsap.ticker.remove(onScrollUpdate)
      window.removeEventListener('resize', handleResize)
    }
  }, [totalRows])

  const setRowRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      rowsRef.current[index] = el
    },
    [],
  )

  return { sectionRef, setRowRef }
}
