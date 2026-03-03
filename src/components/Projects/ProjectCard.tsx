import type { Project } from './types'

interface ProjectCardProps {
  readonly project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden aspect-7/5">
      <div className="relative flex-1 min-h-0 overflow-hidden">
        <img
          src={project.img}
          alt={project.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex justify-between py-1">
        <p className="text-[0.75rem] font-medium uppercase leading-none -tracking-[0.02rem]">
          {project.name}
        </p>
        <p className="text-[0.75rem] font-medium uppercase leading-none -tracking-[0.02rem]">
          {project.year}
        </p>
      </div>
    </div>
  )
}
