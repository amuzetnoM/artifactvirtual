import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight'; // Import rehype-highlight
import { Document } from '../../types';

// Remove the old syntax highlighter imports
// import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { tomorrow } from 'react-syntax-highlighter/dist/styles/prism';

interface MarkdownPreviewProps {
  document: Document;
}

export default function MarkdownPreview({ document }: MarkdownPreviewProps) {
  return (
    // Use theme variables for background and apply prose styles
    <div className="h-full overflow-auto p-4 prose max-w-none prose-headings:mb-4 prose-p:my-3 prose-hr:my-6 prose-img:rounded-lg bg-background text-foreground transition-colors duration-200">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]} 
        components={{
          // Use theme variables for table styling
          img: ({ node, ...props }) => (
            <img className="max-w-full h-auto rounded-lg" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto">
              <table className="border-collapse border border-border" {...props} /> {/* Use CSS variable */}
            </div>
          ),
          th: ({ node, ...props }) => (
            <th className="border px-4 py-2 bg-muted border-border" {...props} /> {/* Use CSS variables */}
          ),
          td: ({ node, ...props }) => (
            <td className="border px-4 py-2 border-border" {...props} /> {/* Use CSS variable */}
          ),
          // rehype-highlight handles code blocks, but ensure its styles work with themes
          // The highlight.js CSS imported in main.tsx might need adjustments or multiple theme imports
        }}
      >
        {document.content}
      </ReactMarkdown>
    </div>
  );
}