import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Code2, Cpu } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background via-background/90 to-background/80">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm">
              <span className="text-primary">New</span>
              <span className="ml-2">AI-powered code generation and analysis</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Build Blockchain Applications with AI Assistance
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Our platform combines powerful AI with comprehensive blockchain tools to help you build, test, and deploy
                smart contracts and decentralized applications.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild size="lg">
                <Link href="/code-editor">
                  <Code2 className="mr-2 h-4 w-4" />
                  Open Code Editor
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/docs">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative h-[300px] w-full md:h-[400px] lg:h-[500px] rounded-lg bg-muted/50 overflow-hidden border">
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                <Cpu className="h-16 w-16 text-primary mb-4" />
                <div className="space-y-2 text-center">
                  <h3 className="text-xl font-semibold">AI-Powered Development</h3>
                  <p className="text-sm text-muted-foreground max-w-[300px]">
                    Get intelligent code suggestions, security analysis, and optimization recommendations as you build.
                  </p>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-[400px]">
                  <div className="flex flex-col items-center justify-center rounded-md bg-background/80 p-4 text-center">
                    <span className="text-lg font-medium">Solidity</span>
                    <span className="text-xs text-muted-foreground">Smart Contracts</span>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-md bg-background/80 p-4 text-center">
                    <span className="text-lg font-medium">Rust</span>
                    <span className="text-xs text-muted-foreground">Blockchain Development</span>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-md bg-background/80 p-4 text-center">
                    <span className="text-lg font-medium">Hardhat</span>
                    <span className="text-xs text-muted-foreground">Testing Framework</span>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-md bg-background/80 p-4 text-center">
                    <span className="text-lg font-medium">Vyper</span>
                    <span className="text-xs text-muted-foreground">Python-like Contracts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
