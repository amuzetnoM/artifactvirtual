import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Document } from '../../types';

interface MarkdownPreviewProps {
  document: Document;
}

export default function MarkdownPreview({ document }: MarkdownPreviewProps) {
  return (
    <div className="h-full overflow-auto p-4 prose max-w-none prose-slate dark:prose-invert prose-headings:mb-4 prose-p:my-3 prose-hr:my-6 dark:prose-hr:border-gray-800 prose-img:rounded-lg dark:bg-gray-950 bg-white transition-colors duration-200">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={tomorrow}
                language={match[1]}
                PreTag="div"
                className="rounded-md overflow-hidden"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
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