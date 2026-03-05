'use client'

import { useRef, useCallback } from 'react'
import gsap from 'gsap'

import type { Project } from './types'

const FADE_DURATION = 0.4

interface ProjectCardProps {
  readonly project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const handleMouseEnter = useCallback(() => {
    const video = videoRef.current
    const img = imgRef.current
    if (!video || !img) return

    video.currentTime = 0
    video.play().catch(() => {})

    gsap.to(video, {
      opacity: 1,
      duration: FADE_DURATION,
      ease: 'power2.inOut',
    })

    gsap.to(img, {
      opacity: 0,
      duration: FADE_DURATION,
      ease: 'power2.inOut',
    })
  }, [])

  const handleMouseLeave = useCallback(() => {
    const video = videoRef.current
    const img = imgRef.current
    if (!video || !img) return

    gsap.to(video, {
      opacity: 0,
      duration: FADE_DURATION,
      ease: 'power2.inOut',
      onComplete: () => {
        video.pause()
        video.currentTime = 0
      },
    })

    gsap.to(img, {
      opacity: 1,
      duration: FADE_DURATION,
      ease: 'power2.inOut',
    })
  }, [])

  const hasVideo = Boolean(project.video)

  return (
    <div
      className="flex flex-1 flex-col overflow-hidden aspect-[7/5]"
      onMouseEnter={hasVideo ? handleMouseEnter : undefined}
      onMouseLeave={hasVideo ? handleMouseLeave : undefined}
    >
      <div className="relative flex-1 min-h-0 overflow-hidden">
        <img
          ref={imgRef}
          src={project.img}
          alt={project.name}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {hasVideo ? (
          <video
            ref={videoRef}
            src={project.video}
            muted
            loop
            playsInline
            preload="none"
            className="absolute inset-0 w-full h-full object-cover opacity-0"
          />
        ) : null}
      </div>

      <div className="flex justify-between py-1">
        <p className="text-[0.9rem] font-medium uppercase leading-none -tracking-[0.02rem]">
          {project.name}
        </p>
        <p className="text-[0.9rem] font-medium uppercase leading-none -tracking-[0.02rem]">
          {project.year}
        </p>
      </div>
    </div>
  )
}
