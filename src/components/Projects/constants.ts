import type { Project, ScrollExpandConfig } from './types'

export const SCROLL_EXPAND_CONFIG: ScrollExpandConfig = {
  projectsPerRow: 9,
  totalRows: 10,
  mobileBreakpoint: 1000,
  desktop: {
    startWidth: 125,
    endWidth: 500,
  },
  mobile: {
    startWidth: 250,
    endWidth: 750,
  },
} as const

export const PROJECTS: Project[] = [
  { name: 'Fieldnotes', year: 2020, img: '/img1.jpg' },
  { name: 'Basic Feather', year: 2021, img: '/basicFeater.jpg' },
  { name: 'Gallery Walk', year: 2019, img: '/img3.jpg' },
  { name: 'Lando Norris', year: 2022, img: '/lando.jpg' },
  { name: 'Op Intelligence', year: 2023, img: '/op.jpg' },
  { name: 'Backboard', year: 2024, img: '/kpr.jpg' },
  { name: 'Afterglow', year: 2021, img: '/redefine.jpg' },
  { name: 'Hill House', year: 2020, img: '/img8.jpg' },
  { name: 'Mont Fort', year: 2018, img: '/montfort.jpg' },
  { name: 'Timepiece', year: 2019, img: '/img10.jpg' },
  { name: 'Sentimental Value', year: 2022, img: '/sentimentalValue.jpg' },
  { name: 'Salin 11', year: 2023, img: '/ahh.jpg' },
  { name: 'Haggar', year: 2024, img: '/haggar.png' },
  { name: 'Deep Red', year: 2021, img: '/anime.png' },
  { name: 'Fast Track', year: 2022, img: '/img15.jpg' },
  { name: 'The Line', year: 2025, img: '/theLine.jpeg' },
]

export const ROWS_DATA: readonly (readonly Project[])[] = Array.from(
  { length: SCROLL_EXPAND_CONFIG.totalRows },
  (_, rowIndex) =>
    Array.from(
      { length: SCROLL_EXPAND_CONFIG.projectsPerRow },
      (_, colIndex) => {
        const projectIndex =
          (rowIndex * SCROLL_EXPAND_CONFIG.projectsPerRow + colIndex) %
          PROJECTS.length
        return PROJECTS[projectIndex]
      },
    ),
)
