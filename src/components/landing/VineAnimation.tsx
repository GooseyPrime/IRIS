'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

export function VineAnimation() {
  const containerRef = useRef<SVGSVGElement>(null)

  useGSAP(
    () => {
      const paths = containerRef.current?.querySelectorAll('.vine-path')
      if (!paths || paths.length === 0) return

      // Set initial state — paths invisible
      paths.forEach((path) => {
        const el = path as SVGPathElement
        const pathLength = el.getTotalLength()
        gsap.set(el, {
          strokeDasharray: pathLength,
          strokeDashoffset: pathLength,
          opacity: 1,
        })
      })

      const tl = gsap.timeline({ delay: 0.3 })

      // Draw each vine path sequentially with slight overlap
      paths.forEach((path, i) => {
        const el = path as SVGPathElement
        tl.to(
          el,
          {
            strokeDashoffset: 0,
            duration: 1.5,
            ease: 'power2.inOut',
          },
          i * 0.6,
        )

        // Fade leaves after their stem draws
        const leaves = containerRef.current?.querySelectorAll(`.vine-leaf-${i}`)
        if (leaves && leaves.length > 0) {
          tl.fromTo(
            leaves,
            { opacity: 0, scale: 0.3, transformOrigin: 'center' },
            { opacity: 1, scale: 1, duration: 0.6, stagger: 0.15, ease: 'back.out(1.5)' },
            i * 0.6 + 1.0,
          )
        }
      })
    },
    { scope: containerRef },
  )

  return (
    <svg
      ref={containerRef}
      viewBox="0 0 400 500"
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Main stem — rises from bottom-left */}
      <path
        className="vine-path"
        d="M 50 500 C 50 400, 80 350, 100 280 C 120 210, 90 150, 120 80"
        stroke="url(#vineGradient)"
        strokeWidth="2"
        fill="none"
        opacity="0"
      />

      {/* Branch 1 — curves right */}
      <path
        className="vine-path"
        d="M 100 280 C 140 260, 180 250, 220 230 C 260 210, 280 190, 300 160"
        stroke="url(#vineGradient)"
        strokeWidth="1.5"
        fill="none"
        opacity="0"
      />

      {/* Branch 2 — curves left from upper stem */}
      <path
        className="vine-path"
        d="M 120 180 C 90 170, 60 155, 40 130 C 20 105, 30 80, 50 60"
        stroke="url(#vineGradient)"
        strokeWidth="1.5"
        fill="none"
        opacity="0"
      />

      {/* Leaves on main stem */}
      <ellipse className="vine-leaf-0" cx="85" cy="320" rx="8" ry="14" transform="rotate(-30 85 320)" fill="#5A3FD3" opacity="0" />
      <ellipse className="vine-leaf-0" cx="115" cy="240" rx="7" ry="12" transform="rotate(25 115 240)" fill="#6B4CE6" opacity="0" />
      <ellipse className="vine-leaf-0" cx="95" cy="150" rx="6" ry="11" transform="rotate(-20 95 150)" fill="#5A3FD3" opacity="0" />

      {/* Leaves on branch 1 */}
      <ellipse className="vine-leaf-1" cx="170" cy="255" rx="7" ry="12" transform="rotate(15 170 255)" fill="#6B4CE6" opacity="0" />
      <ellipse className="vine-leaf-1" cx="250" cy="215" rx="6" ry="11" transform="rotate(30 250 215)" fill="#5A3FD3" opacity="0" />
      <ellipse className="vine-leaf-1" cx="290" cy="170" rx="5" ry="10" transform="rotate(40 290 170)" fill="#6B4CE6" opacity="0" />

      {/* Leaves on branch 2 */}
      <ellipse className="vine-leaf-2" cx="70" cy="160" rx="6" ry="11" transform="rotate(-35 70 160)" fill="#5A3FD3" opacity="0" />
      <ellipse className="vine-leaf-2" cx="40" cy="110" rx="5" ry="10" transform="rotate(-20 40 110)" fill="#6B4CE6" opacity="0" />

      {/* Gold accent dots */}
      <circle className="vine-leaf-0" cx="120" cy="80" r="3" fill="#D4A843" opacity="0" />
      <circle className="vine-leaf-1" cx="300" cy="155" r="2.5" fill="#D4A843" opacity="0" />
      <circle className="vine-leaf-2" cx="50" cy="58" r="2.5" fill="#D4A843" opacity="0" />

      <defs>
        <linearGradient id="vineGradient" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#5A3FD3" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#6B4CE6" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#A48EFF" stopOpacity="0.7" />
        </linearGradient>
      </defs>
    </svg>
  )
}
