import { useState, useEffect, useRef } from 'react';
import { Document } from '../../types';
import EditorToolbar from './EditorToolbar';
import { aiService } from '../../services/aiService'; // Import the AI service

interface MarkdownEditorProps {
  document: Document;
  onChange: (content: string) => void;
}

export default function MarkdownEditor({ document, onChange }: MarkdownEditorProps) {
  const [content, setContent] = useState(document.content);
  const [isCompleting, setIsCompleting] = useState(false); // State for loading indicator
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Update content when document changes (added document.content to dependencies)
  useEffect(() => {
    setContent(document.content);
  }, [document.id, document.content]); // Added document.content
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onChange(newContent);
  };
  
  // Handle toolbar actions
  const insertText = (startText: string, endText: string = '') => {
    if (!textareaRef.current) { return; } // Added braces
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const beforeSelection = content.substring(0, start);
    const afterSelection = content.substring(end);
    
    const newContent = `${beforeSelection}${startText}${selectedText}${endText}${afterSelection}`;
    setContent(newContent);
    onChange(newContent);
    
    // Set cursor position after operation
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + startText.length,
        end + startText.length
      );
    }, 0);
  };
  
  // Toolbar action handlers
  const handleHeading = (level: number) => {
    const prefix = '#'.repeat(level) + ' ';
    
    // If there's selected text, we need to handle potential multi-line selections
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      
      if (start !== end) {
        const selectedText = content.substring(start, end);
        const lines = selectedText.split('\n');
        
        // Add heading to each line
        const newLines = lines.map(line => {
          // Skip empty lines
          if (line.trim() === '') { return line; } // Added braces
          
          // Check if the line already has a heading
          const headingMatch = line.match(/^(#{1,6})\s/);
          if (headingMatch) {
            // Replace the existing heading with the new one
            return line.replace(/^(#{1,6})\s/, prefix);
          }
          
          // Add the heading prefix to the line
          return prefix + line;
        });
        
        const newContent = content.substring(0, start) + newLines.join('\n') + content.substring(end);
        setContent(newContent);
        onChange(newContent);
        return;
      }
    }
    
    // If no text is selected, insert at cursor position
    insertText(prefix);
  };
  
  const handleBold = () => insertText('**', '**');
  const handleItalic = () => insertText('*', '*');
  const handleLink = () => insertText('[', '](url)');
  const handleImage = () => insertText('![alt text](', ')');
  const handleList = () => insertText('- ');
  const handleOrderedList = () => insertText('1. ');
  const handleQuote = () => insertText('> ');
  const handleCode = () => insertText('`', '`');
  const handleCodeBlock = () => insertText('```\n', '\n```');
  
  // Handler for AI text completion
  const handleCompleteText = async () => {
    if (!textareaRef.current || isCompleting) { return; } // Added braces

    const textarea = textareaRef.current;
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = content.substring(0, cursorPosition);

    // Use the last ~100 chars (or less) as prompt, can be adjusted
    const prompt = textBeforeCursor.slice(-100);

    setIsCompleting(true);
    try {
      const completion = await aiService.getCompletion(prompt);
      if (completion && !completion.startsWith('Error:')) {
        // Insert the completion at the cursor position
        const newContent = 
          content.substring(0, cursorPosition) + 
          completion + 
          content.substring(cursorPosition);
        
        setContent(newContent);
        onChange(newContent);

        // Set cursor position after the inserted completion
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(
            cursorPosition + completion.length,
            cursorPosition + completion.length
          );
        }, 0);
      } else {
        // Handle potential errors shown in the completion string itself
        console.error("AI Completion failed:", completion);
        // Optionally show a notification to the user
      }
    } catch (error) {
      console.error("Error calling AI service:", error);
      // Optionally show a notification to the user
    } finally {
      setIsCompleting(false);
    }
  };
  
  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transition-colors duration-200">
      <EditorToolbar
        onHeading={handleHeading}
        onBold={handleBold}
        onItalic={handleItalic}
        onLink={handleLink}
        onImage={handleImage}
        onList={handleList}
        onOrderedList={handleOrderedList}
        onQuote={handleQuote}
        onCode={handleCode}
        onCodeBlock={handleCodeBlock}
        onCompleteText={handleCompleteText} // Pass the handler
      />
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleContentChange}
        className={`flex-1 p-4 resize-none focus:outline-none font-mono text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-950 transition-colors duration-200 w-full ${isCompleting ? 'opacity-70 cursor-wait' : ''}`}
        placeholder="Start writing in Markdown..."
        spellCheck={true}
        disabled={isCompleting} // Disable textarea while completing
      />
      {/* Optional: Add a more prominent loading indicator */}
      {isCompleting && (
        <div className="absolute inset-0 bg-gray-500 bg-opacity-20 flex items-center justify-center">
          <p className="text-white bg-black bg-opacity-70 px-4 py-2 rounded">AI is thinking...</p>
        </div>
      )}
    </div>
  );
}