'use client'

import { useEffect, useRef } from 'react'
import { ReactLenis, type LenisRef } from 'lenis/react'
import gsap from 'gsap'

import Projects from '@/components/Projects/Projects'

export default function Home() {
  const lenisRef = useRef<LenisRef>(null)

  useEffect(() => {
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000)
    }

    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(update)
    }
  }, [])

  return (
    <>
      <ReactLenis root options={{ autoRaf: false }} ref={lenisRef} />

      <section className="relative flex h-svh w-full items-center justify-center overflow-hidden">
        <p className="text-sm font-medium uppercase tracking-tight">
          Intro Section
        </p>
      </section>

      <Projects />

      <section className="relative flex h-svh w-full items-center justify-center overflow-hidden">
        <p className="text-sm font-medium uppercase tracking-tight">
          Outro Section
        </p>
      </section>
    </>
  )
}
