'use client'

import { ROWS_DATA, SCROLL_EXPAND_CONFIG } from './constants'
import { ProjectCard } from './ProjectCard'
import { useScrollExpand } from './useScrollExpand'

export default function Projects() {
  const { sectionRef, setRowRef } = useScrollExpand(
    SCROLL_EXPAND_CONFIG.totalRows,
  )
  
  return (
    <section
      ref={sectionRef}
      className="relative flex w-full flex-col items-center gap-2 overflow-hidden py-2"
    >
      {ROWS_DATA.map((rowProjects, rowIndex) => (
        <div
          key={rowIndex}
          ref={setRowRef(rowIndex)}
          className="flex w-[125%] gap-4"
        >
          {rowProjects.map((project, colIndex) => (
            <ProjectCard key={`${rowIndex}-${colIndex}`} project={project} />
          ))}
        </div>
      ))}
    </section>
  )
}
