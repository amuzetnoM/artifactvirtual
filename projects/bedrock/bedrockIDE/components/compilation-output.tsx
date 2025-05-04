import { ScrollArea } from "@/components/ui/scroll-area"

interface CompilationOutputProps {
  output: string
}

export function CompilationOutput({ output }: CompilationOutputProps) {
  if (!output) {
    return (
      <div className="h-full p-4 flex items-center justify-center text-muted-foreground">
        No output yet. Compile or deploy your contract to see results here.
      </div>
    )
  }

  return (
    <ScrollArea className="h-full p-4">
      <pre className="font-mono text-sm whitespace-pre-wrap">{output}</pre>
    </ScrollArea>
  )
}
