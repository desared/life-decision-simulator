"use client"

import { useRef, useEffect, useCallback } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
}

interface InteractiveNetworkProps {
  className?: string
  particleCount?: number
  connectionDistance?: number
  mouseRadius?: number
}

export function InteractiveNetwork({
  className = "",
  particleCount = 40,
  connectionDistance = 120,
  mouseRadius = 150,
}: InteractiveNetworkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const animFrameRef = useRef<number>(0)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = []
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.5 + 1,
      })
    }
    particlesRef.current = particles
  }, [particleCount])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const setSize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect()
      if (!rect) return
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      ctx.scale(dpr, dpr)
      if (particlesRef.current.length === 0) {
        initParticles(rect.width, rect.height)
      }
    }

    setSize()

    resizeObserverRef.current = new ResizeObserver(() => {
      setSize()
    })
    if (canvas.parentElement) {
      resizeObserverRef.current.observe(canvas.parentElement)
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 }
    }

    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseleave", handleMouseLeave)

    const getColor = () => {
      const isDark = document.documentElement.classList.contains("dark")
      return {
        particle: isDark ? "rgba(168, 140, 255, 0.5)" : "rgba(100, 60, 200, 0.3)",
        line: isDark ? "rgba(168, 140, 255," : "rgba(100, 60, 200,",
        mouseLine: isDark ? "rgba(200, 170, 255," : "rgba(120, 80, 220,",
      }
    }

    const animate = () => {
      const rect = canvas.parentElement?.getBoundingClientRect()
      if (!rect) return
      const width = rect.width
      const height = rect.height
      const colors = getColor()

      ctx.clearRect(0, 0, width, height)
      const particles = particlesRef.current
      const mouse = mouseRef.current

      for (const p of particles) {
        // Mouse repulsion
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < mouseRadius && dist > 0) {
          const force = (mouseRadius - dist) / mouseRadius
          p.vx += (dx / dist) * force * 0.3
          p.vy += (dy / dist) * force * 0.3
        }

        // Dampen velocity
        p.vx *= 0.98
        p.vy *= 0.98

        // Move
        p.x += p.vx
        p.y += p.vy

        // Bounce off edges
        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1
        p.x = Math.max(0, Math.min(width, p.x))
        p.y = Math.max(0, Math.min(height, p.y))

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = colors.particle
        ctx.fill()
      }

      // Draw connections between particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < connectionDistance) {
            const opacity = (1 - dist / connectionDistance) * 0.2
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `${colors.line}${opacity})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      // Draw connections from mouse to nearby particles
      if (mouse.x > 0 && mouse.y > 0) {
        for (const p of particles) {
          const dx = p.x - mouse.x
          const dy = p.y - mouse.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < mouseRadius) {
            const opacity = (1 - dist / mouseRadius) * 0.35
            ctx.beginPath()
            ctx.moveTo(mouse.x, mouse.y)
            ctx.lineTo(p.x, p.y)
            ctx.strokeStyle = `${colors.mouseLine}${opacity})`
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseleave", handleMouseLeave)
      resizeObserverRef.current?.disconnect()
    }
  }, [initParticles, connectionDistance, mouseRadius])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-auto ${className}`}
      style={{ zIndex: 0 }}
    />
  )
}
