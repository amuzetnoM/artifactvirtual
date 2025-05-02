import { 
  Bold, 
  Italic, 
  Link, 
  Image, 
  List, 
  ListOrdered, 
  Quote,
  Code,
  FileCode,
  Heading1,
  Heading2,
  Heading3,
  Sparkles,
  Settings,
  FileEdit,
  Share
} from 'lucide-react';

interface EditorToolbarProps {
  onHeading: (level: number) => void;
  onBold: () => void;
  onItalic: () => void;
  onLink: () => void;
  onImage: () => void;
  onList: () => void;
  onOrderedList: () => void;
  onQuote: () => void;
  onCode: () => void;
  onCodeBlock: () => void;
  onCompleteText: () => void;
  onOpenSettings: () => void;
  onOpenMetadata: () => void;
  onOpenPublish: () => void;
  onGenerateContent: () => void;
}

export default function EditorToolbar({
  onHeading,
  onBold,
  onItalic,
  onLink,
  onImage,
  onList,
  onOrderedList,
  onQuote,
  onCode,
  onCodeBlock,
  onCompleteText,
  onOpenSettings,
  onOpenMetadata,
  onOpenPublish,
  onGenerateContent,
}: EditorToolbarProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-800 p-2 flex items-center space-x-1 overflow-x-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <ToolbarButton onClick={() => onHeading(1)} tooltip="Heading 1">
        <Heading1 size={18} />
      </ToolbarButton>
      <ToolbarButton onClick={() => onHeading(2)} tooltip="Heading 2">
        <Heading2 size={18} />
      </ToolbarButton>
      <ToolbarButton onClick={() => onHeading(3)} tooltip="Heading 3">
        <Heading3 size={18} />
      </ToolbarButton>
      
      <ToolbarDivider />
      
      <ToolbarButton onClick={onBold} tooltip="Bold">
        <Bold size={18} />
      </ToolbarButton>
      <ToolbarButton onClick={onItalic} tooltip="Italic">
        <Italic size={18} />
      </ToolbarButton>
      
      <ToolbarDivider />
      
      <ToolbarButton onClick={onLink} tooltip="Link">
        <Link size={18} />
      </ToolbarButton>
      <ToolbarButton onClick={onImage} tooltip="Image">
        <Image size={18} />
      </ToolbarButton>
      
      <ToolbarDivider />
      
      <ToolbarButton onClick={onList} tooltip="Bullet List">
        <List size={18} />
      </ToolbarButton>
      <ToolbarButton onClick={onOrderedList} tooltip="Numbered List">
        <ListOrdered size={18} />
      </ToolbarButton>
      
      <ToolbarDivider />
      
      <ToolbarButton onClick={onQuote} tooltip="Quote">
        <Quote size={18} />
      </ToolbarButton>
      <ToolbarButton onClick={onCode} tooltip="Inline Code">
        <Code size={18} />
      </ToolbarButton>
      <ToolbarButton onClick={onCodeBlock} tooltip="Code Block">
        <FileCode size={18} />
      </ToolbarButton>
      
      <ToolbarDivider />
      
      {/* AI Features */}
      <ToolbarButton onClick={onCompleteText} tooltip="Complete Text (AI)">
        <Sparkles size={18} className="text-purple-500" />
      </ToolbarButton>
      <ToolbarButton onClick={onGenerateContent} tooltip="Generate Content (AI)">
        <Sparkles size={18} className="text-blue-500" />
      </ToolbarButton>
      
      <div className="flex-grow" /> {/* Spacer to push the next items to the right */}
      
      <ToolbarButton onClick={onOpenMetadata} tooltip="Document Metadata">
        <FileEdit size={18} />
      </ToolbarButton>
      <ToolbarButton onClick={onOpenPublish} tooltip="Publish Document">
        <Share size={18} />
      </ToolbarButton>
      <ToolbarButton onClick={onOpenSettings} tooltip="Settings">
        <Settings size={18} />
      </ToolbarButton>
    </div>
  );
}

interface ToolbarButtonProps {
  onClick: () => void;
  tooltip: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, tooltip, children }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors duration-150"
      title={tooltip}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="h-6 border-r border-gray-200 dark:border-gray-700 mx-1" />;
}