import { Code, FileCode, Lock, Zap, Cpu, BarChart } from 'lucide-react'

export function Features() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Platform Features</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our comprehensive platform provides everything you need to build, test, and deploy blockchain applications.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3 lg:gap-12">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Cpu className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">AI-Powered Assistance</h3>
            <p className="text-muted-foreground">Get intelligent code suggestions, security analysis, and optimization recommendations.</p>
          </div>
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Code className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Multi-Language Support</h3>
            <p className="text-muted-foreground">Write code in Solidity, Rust, Vyper, and use Hardhat for testing and deployment.</p>
          </div>
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Local-First Storage</h3>
            <p className="text-muted-foreground">Your code is stored locally first, ensuring privacy and performance for large projects.</p>
          </div>
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <FileCode className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Smart Contract Templates</h3>
            <p className="text-muted-foreground">Start quickly with pre-built templates for tokens, NFTs, DAOs, and more.</p>
          </div>
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">One-Click Deployment</h3>
            <p className="text-muted-foreground">Deploy your contracts to multiple blockchains with a single click.</p>
          </div>
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <BarChart className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Analytics & Monitoring</h3>
            <p className="text-muted-foreground">Monitor your deployed contracts with real-time analytics and alerts.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
