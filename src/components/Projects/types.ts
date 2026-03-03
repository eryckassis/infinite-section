export interface Project {
  readonly name: string
  readonly year: number
  readonly img: string
  readonly href: string
}

export interface WidthRange {
  readonly startWidth: number
  readonly endWidth: number
}

export interface ScrollExpandConfig {
  readonly projectsPerRow: number
  readonly totalRows: number
  readonly mobileBreakpoint: number
  readonly desktop: WidthRange
  readonly mobile: WidthRange
}
