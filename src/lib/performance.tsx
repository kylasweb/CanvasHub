"use client"

import { useEffect, useState, Suspense, lazy, useCallback } from "react"

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()
  private observers: Set<(metrics: Record<string, number>) => void> = new Set()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  measure(name: string, duration: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    this.metrics.get(name)!.push(duration)
    this.notifyObservers()
  }

  getMetrics(): Record<string, number> {
    const result: Record<string, number> = {}
    this.metrics.forEach((values, key) => {
      const avg = values.reduce((a, b) => a + b, 0) / values.length
      result[key] = Number(avg.toFixed(2))
    })
    return result
  }

  subscribe(callback: (metrics: Record<string, number>) => void): () => void {
    this.observers.add(callback)
    return () => this.observers.delete(callback)
  }

  private notifyObservers(): void {
    const metrics = this.getMetrics()
    this.observers.forEach(callback => callback(metrics))
  }
}

// Hook for performance monitoring
export function usePerformance() {
  const [metrics, setMetrics] = useState<Record<string, number>>({})

  useEffect(() => {
    const monitor = PerformanceMonitor.getInstance()
    const unsubscribe = monitor.subscribe(setMetrics)
    return unsubscribe
  }, [])

  const measure = useCallback((name: string, fn: () => void) => {
    const start = performance.now()
    fn()
    const end = performance.now()
    PerformanceMonitor.getInstance().measure(name, end - start)
  }, [])

  const measureAsync = useCallback(async (name: string, fn: () => Promise<any>) => {
    const start = performance.now()
    const result = await fn()
    const end = performance.now()
    PerformanceMonitor.getInstance().measure(name, end - start)
    return result
  }, [])

  return { metrics, measure, measureAsync }
}

// Component size tracker
export function useComponentSize() {
  const [sizes, setSizes] = useState<Record<string, number>>({})

  const trackComponent = (name: string, size: number) => {
    setSizes(prev => ({
      ...prev,
      [name]: size
    }))
  }

  return { sizes, trackComponent }
}

// Lazy loading with performance tracking
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  componentName: string,
  LoadingComponent?: React.ComponentType
) {
  const LazyComp = lazy(() => {
    const start = performance.now()
    return importFn().then(module => {
      const end = performance.now()
      PerformanceMonitor.getInstance().measure(`lazy-load-${componentName}`, end - start)
      return module
    })
  })

  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={LoadingComponent ? <LoadingComponent /> : null}>
        <LazyComp {...props} />
      </Suspense>
    )
  }
}