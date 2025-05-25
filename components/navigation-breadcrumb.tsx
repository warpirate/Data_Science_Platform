"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ChevronRight, Home, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface NavigationBreadcrumbProps {
  items?: BreadcrumbItem[]
  showBackButton?: boolean
  onBack?: () => void
  className?: string
}

export function NavigationBreadcrumb({
  items,
  showBackButton = true,
  onBack,
  className = "",
}: NavigationBreadcrumbProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [breadcrumbItems, setBreadcrumbItems] = useState<BreadcrumbItem[]>([])

  useEffect(() => {
    if (items) {
      setBreadcrumbItems(items)
    } else {
      // Auto-generate breadcrumbs from pathname
      const pathSegments = pathname.split("/").filter(Boolean)
      const generatedItems: BreadcrumbItem[] = [{ label: "Home", href: "/" }]

      pathSegments.forEach((segment, index) => {
        const href = "/" + pathSegments.slice(0, index + 1).join("/")
        const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")
        const current = index === pathSegments.length - 1

        generatedItems.push({ label, href: current ? undefined : href, current })
      })

      setBreadcrumbItems(generatedItems)
    }
  }, [items, pathname])

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showBackButton && (
        <>
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <Separator orientation="vertical" className="h-4" />
        </>
      )}

      <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
        {breadcrumbItems.map((item, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
            {item.current ? (
              <span className="font-medium text-foreground">{item.label}</span>
            ) : item.href ? (
              <Link href={item.href} className="hover:text-foreground transition-colors">
                {index === 0 && <Home className="h-4 w-4 mr-1 inline" />}
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
          </div>
        ))}
      </nav>
    </div>
  )
}
