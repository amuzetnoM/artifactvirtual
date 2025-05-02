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
    <div className="h-full overflow-auto p-4 prose max-w-none prose-slate dark:prose-invert prose-headings:mb-4 prose-p:my-3 prose-hr:my-6 dark:prose-hr:border-gray-800 prose-img:rounded-lg dark:bg-gray-950 bg-white transition-colors duration-200">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        // Add rehypeHighlight alongside rehypeRaw
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        // Remove the custom components for code handling
        components={{
          // code component is no longer needed, rehype-highlight handles it
          img: ({ node, ...props }) => (
            <img className="max-w-full h-auto rounded-lg" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto">
              <table className="border-collapse border border-gray-300 dark:border-gray-700" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 bg-gray-100 dark:bg-gray-800" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="border border-gray-300 dark:border-gray-700 px-4 py-2" {...props} />
          ),
        }}
      >
        {document.content}
      </ReactMarkdown>
    </div>
  );
}