"use client"

import { lazy, Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

// Loading components for different UI elements
export const ChartLoading = () => (
  <div className="flex items-center justify-center h-[400px]">
    <div className="text-center">
      <Skeleton className="h-[200px] w-[300px] mx-auto mb-4" />
      <Skeleton className="h-4 w-48 mx-auto" />
    </div>
  </div>
)

export const SidebarLoading = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="text-center">
      <Skeleton className="h-[300px] w-[250px] mx-auto mb-4" />
      <Skeleton className="h-4 w-32 mx-auto" />
    </div>
  </div>
)

export const MenuLoading = () => (
  <div className="space-y-2">
    {Array.from({ length: 5 }).map((_, i) => (
      <Skeleton key={i} className="h-8 w-full" />
    ))}
  </div>
)

// Lazy loading wrapper component
export function LazyComponent<T extends React.ComponentType<any>>(
  Component: T,
  LoadingComponent?: React.ComponentType,
  fallback?: React.ReactNode
) {
  const LazyComp = lazy(() => Promise.resolve({ default: Component }))
  
  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback || (LoadingComponent ? <LoadingComponent /> : null)}>
        <LazyComp {...props} />
      </Suspense>
    )
  }
}

// Chart components with lazy loading
export const LazyChart = LazyComponent(
  lazy(() => import("@/components/ui/chart").then(mod => ({ default: mod.ChartContainer }))),
  ChartLoading
)

// Sidebar components with lazy loading
export const LazySidebar = LazyComponent(
  lazy(() => import("@/components/ui/sidebar").then(mod => ({ default: mod.Sidebar }))),
  SidebarLoading
)

// Menu components with lazy loading
export const LazyMenu = LazyComponent(
  lazy(() => import("@/components/ui/menubar").then(mod => ({ default: mod.Menubar }))),
  MenuLoading
)