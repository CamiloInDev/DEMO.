import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

export function useFadeInUp(ref: React.RefObject<HTMLDivElement | null>, delay: number = 0) {
  const done = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el || done.current) return
    done.current = true
    if (prefersReducedMotion()) {
      el.style.opacity = "1"
      el.style.transform = "translateY(0)"
      return
    }
    gsap.fromTo(el, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, delay, ease: "power3.out" })
  }, [ref, delay])
}

export function useStaggerFade(containerRef: React.RefObject<HTMLDivElement | null>, items: string, stagger: number = 0.1) {
  const done = useRef(false)
  useEffect(() => {
    const el = containerRef.current
    if (!el || done.current) return
    done.current = true
    const children = el.querySelectorAll(items)
    if (!children.length) return
    if (prefersReducedMotion()) {
      children.forEach((child) => {
        ;(child as HTMLElement).style.opacity = "1"
        ;(child as HTMLElement).style.transform = "translateY(0)"
      })
      return
    }
    gsap.fromTo(children, { opacity: 0, y: 40 }, {
      opacity: 1, y: 0, duration: 0.5, stagger,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 85%" },
    })
  }, [containerRef, items, stagger])
}

export function useHeroAnimation(ref: React.RefObject<HTMLDivElement | null>) {
  const done = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el || done.current) return
    done.current = true
    const animEls = el.querySelectorAll("[data-anim]")
    if (!animEls.length) return
    if (prefersReducedMotion()) {
      animEls.forEach((child) => {
        ;(child as HTMLElement).style.opacity = "1"
        ;(child as HTMLElement).style.transform = "translateY(0)"
      })
      return
    }
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } })
    tl.fromTo(animEls, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.15 })
  }, [ref])
}
