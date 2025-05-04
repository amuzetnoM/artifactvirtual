import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HeroSection } from "@/components/hero-section"
import { Features } from "@/components/features"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CodeBlock } from "@/components/code-block"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <Features />

        <section className="container py-16 md:py-24 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Powerful AI-Assisted Development
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Our platform combines advanced AI with comprehensive blockchain tools to accelerate your development
              workflow.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">AI-Powered Code Completion</h3>
              <p className="text-muted-foreground">
                Get intelligent code suggestions as you type, with context-aware completions for Solidity, Rust, and
                more.
              </p>
              <CodeBlock
                language="solidity"
                code={`// AI will suggest function implementations
contract Token {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    
    // AI completes function signatures and implementations
    function transfer(address to, uint256 amount) public returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}`}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Smart Contract Analysis</h3>
              <p className="text-muted-foreground">
                Our AI analyzes your smart contracts for security vulnerabilities and optimization opportunities.
              </p>
              <div className="bg-muted rounded-lg p-4 text-sm">
                <div className="flex items-center gap-2 text-green-500 font-medium mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  Security Analysis Complete
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">⚠️</span>
                    <span>Consider adding reentrancy protection to the withdraw function</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Access control implemented correctly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">ℹ️</span>
                    <span>Gas optimization: Consider using uint128 instead of uint256 for small values</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-12 space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to get started?</h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Explore our tools and start building your blockchain applications today.
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/code-editor">Code Editor</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/blockchain">Blockchain Tools</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
