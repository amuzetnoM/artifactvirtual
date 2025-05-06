import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
  showText?: boolean
}

export function Logo({ className, size = "md", showText = true }: LogoProps) {
  const sizes = {
    sm: "h-6",
    md: "h-8",
    lg: "h-10",
  }

  const textSizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-xl",
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("relative", sizes[size])}>
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("h-full w-auto")}>
          {/* A triangle */}
          <path d="M6 24L12 8L18 24H6Z" className="fill-primary animate-float" style={{ animationDelay: "0s" }} />
          {/* V triangle */}
          <path d="M14 8L20 24L26 8H14Z" className="fill-[#4ADE80] animate-float" style={{ animationDelay: "0.2s" }} />
        </svg>
      </div>
      {showText && <span className={cn("font-bold gradient-text", textSizes[size])}>Artifact Virtual</span>}
    </div>
  )
}
