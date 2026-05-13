import { useEffect, useRef, useState } from "react"

export function useCartPulse(itemCount: number) {
  const [pulseKey, setPulseKey] = useState(0)
  const prevCount = useRef(itemCount)

  useEffect(() => {
    if (itemCount > prevCount.current) {
      setPulseKey((k) => k + 1)
    }
    prevCount.current = itemCount
  }, [itemCount])

  return pulseKey
}
