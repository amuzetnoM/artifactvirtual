import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CodeEditorWithAI } from "@/components/code-editor-with-ai"

export default function CodeEditorPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <CodeEditorWithAI />
      </main>
      <Footer />
    </div>
  )
}
