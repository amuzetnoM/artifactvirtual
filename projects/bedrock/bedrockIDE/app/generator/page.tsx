import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ThreeDGenerator } from "@/components/three-d-generator"
import { Skeleton } from "@/components/ui/skeleton"

export default function GeneratorPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container py-8">
          <h1 className="text-3xl font-bold mb-6">3D Model Generator</h1>
          <Suspense fallback={<Skeleton className="w-full h-[600px]" />}>
            <ThreeDGenerator />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  )
}
