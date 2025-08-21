'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils/utils';
import {
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  WrapTextIcon,
  UnfoldHorizontalIcon,
} from 'lucide-react';
import type { ComponentProps, HTMLAttributes, ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { nord, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

type CodeBlockContextType = {
  code: string;
  language: string;
  isWrapped: boolean;
  setLanguage: (language: string) => void;
  setIsWrapped: (wrapped: boolean) => void;
};

const CodeBlockContext = createContext<CodeBlockContextType>({
  code: '',
  language: 'javascript',
  isWrapped: false,
  setLanguage: () => {},
  setIsWrapped: () => {},
});

export type CodeBlockProps = HTMLAttributes<HTMLDivElement> & {
  code: string;
  language: string;
  showLineNumbers?: boolean;
  children?: ReactNode;
  allowLanguageChange?: boolean;
};

// Common programming languages for the select dropdown
const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'scss', label: 'SCSS' },
  { value: 'json', label: 'JSON' },
  { value: 'xml', label: 'XML' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'bash', label: 'Bash' },
  { value: 'sql', label: 'SQL' },
  { value: 'dockerfile', label: 'Dockerfile' },
  { value: 'nginx', label: 'Nginx' },
  { value: 'apache', label: 'Apache' },
  { value: 'plaintext', label: 'Plain Text' },
];

export const CodeBlock = ({
  code,
  language: initialLanguage,
  showLineNumbers = false,
  className,
  children,
  allowLanguageChange = false,
  ...props
}: CodeBlockProps) => {
  const [language, setLanguage] = useState(initialLanguage);
  const [isWrapped, setIsWrapped] = useState(false);

  const contextValue = {
    code,
    language,
    isWrapped,
    setLanguage,
    setIsWrapped,
  };

  const displayLanguage =
    SUPPORTED_LANGUAGES.find(
      lang => lang.value === language,
    )?.label.toLowerCase() || language;

  return (
    <CodeBlockContext.Provider value={contextValue}>
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-lg border bg-background text-foreground',
          className,
        )}
        {...props}
      >
        {/* Floating header elements */}
        <div className="absolute top-0 left-0 z-10">
          {allowLanguageChange ? (
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="h-6 w-auto min-w-[80px] border-0 bg-muted/80 backdrop-blur-sm text-xs font-medium text-muted-foreground px-2 py-1 rounded">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map(lang => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="inline-flex items-center h-6 px-2 py-1 bg-muted/80 backdrop-blur-sm text-sm font-medium text-muted-foreground rounded-tr-0 rounded-bl-0">
              {displayLanguage}
            </div>
          )}
        </div>

        {children && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
            {children}
          </div>
        )}

        <div className="relative">
          <ScrollArea className="w-full">
            <div className={cn(!isWrapped && 'w-max min-w-full')}>
              {/* Light theme syntax highlighter */}
              <SyntaxHighlighter
                className="overflow-hidden dark:hidden"
                codeTagProps={{
                  className: 'font-mono text-sm',
                }}
                customStyle={{
                  margin: 0,
                  padding: '3rem 1rem 1rem 1rem', // Extra top padding for floating header
                  fontSize: '0.875rem',
                  background: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))',
                  whiteSpace: isWrapped ? 'pre-wrap' : 'pre',
                }}
                language={language}
                lineNumberStyle={{
                  color: 'hsl(var(--muted-foreground))',
                  paddingRight: '1rem',
                  minWidth: '2.5rem',
                }}
                showLineNumbers={showLineNumbers}
                style={oneLight}
                wrapLines={isWrapped}
                wrapLongLines={isWrapped}
              >
                {code}
              </SyntaxHighlighter>

              {/* Dark theme syntax highlighter */}
              <SyntaxHighlighter
                className="hidden overflow-hidden dark:block"
                codeTagProps={{
                  className: 'font-mono text-sm',
                }}
                customStyle={{
                  margin: 0,
                  padding: '3rem 1rem 1rem 1rem', // Extra top padding for floating header
                  fontSize: '0.875rem',
                  background: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))',
                  whiteSpace: isWrapped ? 'pre-wrap' : 'pre',
                }}
                language={language}
                lineNumberStyle={{
                  color: 'hsl(var(--muted-foreground))',
                  paddingRight: '1rem',
                  minWidth: '2.5rem',
                }}
                showLineNumbers={showLineNumbers}
                style={nord}
                wrapLines={isWrapped}
                wrapLonges={isWrapped}
              >
                {code}
              </SyntaxHighlighter>
            </div>
            {!isWrapped && <ScrollBar orientation="horizontal" />}
          </ScrollArea>
        </div>
      </div>
    </CodeBlockContext.Provider>
  );
};

export type CodeBlockCopyButtonProps = ComponentProps<typeof Button> & {
  onCopy?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
};

export const CodeBlockCopyButton = ({
  onCopy,
  onError,
  timeout = 2000,
  children,
  className,
  ...props
}: CodeBlockCopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const { code } = useContext(CodeBlockContext);

  const copyToClipboard = async () => {
    if (typeof window === 'undefined' || !navigator.clipboard.writeText) {
      onError?.(new Error('Clipboard API not available'));
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      onCopy?.();
      setTimeout(() => setIsCopied(false), timeout);
    } catch (error) {
      onError?.(error as Error);
    }
  };

  const Icon = isCopied ? CheckIcon : CopyIcon;

  return (
    <Button
      className={cn(
        'h-7 w-7 bg-muted/80 backdrop-blur-sm hover:bg-muted border-0 text-muted-foreground hover:text-foreground',
        className,
      )}
      onClick={copyToClipboard}
      size="icon"
      variant="ghost"
      {...props}
    >
      {children ?? <Icon size={14} />}
    </Button>
  );
};

export type CodeBlockDownloadButtonProps = ComponentProps<typeof Button> & {
  filename?: string;
  onDownload?: () => void;
  onError?: (error: Error) => void;
};

export const CodeBlockDownloadButton = ({
  filename,
  onDownload,
  onError,
  children,
  className,
  ...props
}: CodeBlockDownloadButtonProps) => {
  const { code, language } = useContext(CodeBlockContext);

  const getFileExtension = (lang: string): string => {
    const extensions: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      csharp: 'cs',
      php: 'php',
      ruby: 'rb',
      go: 'go',
      rust: 'rs',
      html: 'html',
      css: 'css',
      scss: 'scss',
      json: 'json',
      xml: 'xml',
      yaml: 'yml',
      markdown: 'md',
      bash: 'sh',
      sql: 'sql',
      dockerfile: 'dockerfile',
      nginx: 'conf',
      apache: 'conf',
      plaintext: 'txt',
    };
    return extensions[lang] || 'txt';
  };

  const downloadCode = () => {
    try {
      const blob = new Blob([code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');

      const finalFilename = filename || `code.${getFileExtension(language)}`;
      a.href = url;
      a.download = finalFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onDownload?.();
    } catch (error) {
      onError?.(error as Error);
    }
  };

  return (
    <Button
      className={cn(
        'h-7 w-7 bg-muted/80 backdrop-blur-sm hover:bg-muted border-0 text-muted-foreground hover:text-foreground',
        className,
      )}
      onClick={downloadCode}
      size="icon"
      variant="ghost"
      {...props}
    >
      {children ?? <DownloadIcon size={14} />}
    </Button>
  );
};

export type CodeBlockWrapButtonProps = ComponentProps<typeof Button> & {
  onToggle?: (wrapped: boolean) => void;
};

export const CodeBlockWrapButton = ({
  onToggle,
  children,
  className,
  ...props
}: CodeBlockWrapButtonProps) => {
  const { isWrapped, setIsWrapped } = useContext(CodeBlockContext);

  const toggleWrap = () => {
    const newWrapped = !isWrapped;
    setIsWrapped(newWrapped);
    onToggle?.(newWrapped);
  };

  const Icon = isWrapped ? UnfoldHorizontalIcon : WrapTextIcon;

  return (
    <Button
      className={cn(
        'h-7 w-7 bg-muted/80 backdrop-blur-sm hover:bg-muted border-0 text-muted-foreground hover:text-foreground',
        className,
      )}
      onClick={toggleWrap}
      size="icon"
      variant="ghost"
      {...props}
    >
      {children ?? <Icon size={14} />}
    </Button>
  );
};
