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
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { nord, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

type SupportedLanguage = {
  value: string;
  label: string;
  extension: string;
};

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

// Constants for styling and configuration
const FLOATING_HEADER_STYLES = 'absolute top-0 left-0 z-10';
const FLOATING_ACTIONS_STYLES =
  'absolute top-2 right-2 z-10 flex items-center gap-1';
const BACKDROP_STYLES = 'bg-muted/80 backdrop-blur-sm';
const BUTTON_STYLES = `${BACKDROP_STYLES} hover:bg-muted border-0 text-muted-foreground hover:text-foreground`;

// Syntax highlighter common props
const SYNTAX_HIGHLIGHTER_COMMON_PROPS = {
  codeTagProps: {
    className: 'font-mono text-sm',
  },
  lineNumberStyle: {
    color: 'hsl(var(--muted-foreground))',
    paddingRight: '1rem',
    minWidth: '2.5rem',
  },
  fontSize: '0.875rem',
  padding: '3rem 1rem 1rem 1rem', // Extra top padding for floating header
};

// Common programming languages for the select dropdown with file extensions
const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { value: 'javascript', label: 'JavaScript', extension: 'js' },
  { value: 'typescript', label: 'TypeScript', extension: 'ts' },
  { value: 'python', label: 'Python', extension: 'py' },
  { value: 'java', label: 'Java', extension: 'java' },
  { value: 'cpp', label: 'C++', extension: 'cpp' },
  { value: 'c', label: 'C', extension: 'c' },
  { value: 'csharp', label: 'C#', extension: 'cs' },
  { value: 'php', label: 'PHP', extension: 'php' },
  { value: 'ruby', label: 'Ruby', extension: 'rb' },
  { value: 'go', label: 'Go', extension: 'go' },
  { value: 'rust', label: 'Rust', extension: 'rs' },
  { value: 'html', label: 'HTML', extension: 'html' },
  { value: 'css', label: 'CSS', extension: 'css' },
  { value: 'scss', label: 'SCSS', extension: 'scss' },
  { value: 'json', label: 'JSON', extension: 'json' },
  { value: 'xml', label: 'XML', extension: 'xml' },
  { value: 'yaml', label: 'YAML', extension: 'yml' },
  { value: 'markdown', label: 'Markdown', extension: 'md' },
  { value: 'bash', label: 'Bash', extension: 'sh' },
  { value: 'sql', label: 'SQL', extension: 'sql' },
  { value: 'dockerfile', label: 'Dockerfile', extension: 'dockerfile' },
  { value: 'nginx', label: 'Nginx', extension: 'conf' },
  { value: 'apache', label: 'Apache', extension: 'conf' },
  { value: 'plaintext', label: 'Plain Text', extension: 'txt' },
];

// Utility function to get file extension for a language
const getFileExtension = (lang: string): string => {
  const language = SUPPORTED_LANGUAGES.find(l => l.value === lang);
  return language?.extension || 'txt';
};

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

  const contextValue = useMemo<CodeBlockContextType>(
    () => ({
      code,
      language,
      isWrapped,
      setLanguage,
      setIsWrapped,
    }),
    [code, language, isWrapped],
  );

  const displayLanguage = useMemo(
    () =>
      SUPPORTED_LANGUAGES.find(
        lang => lang.value === language,
      )?.label.toLowerCase() || language,
    [language],
  );

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
        <div className={FLOATING_HEADER_STYLES}>
          {allowLanguageChange ? (
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger
                className={`h-6 w-auto min-w-[80px] border-0 ${BACKDROP_STYLES} text-xs font-medium text-muted-foreground px-2 py-1 rounded`}
              >
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
            <div
              className={`inline-flex items-center h-6 px-2 py-1 ${BACKDROP_STYLES} text-sm font-medium text-muted-foreground rounded-tr-0 rounded-bl-0`}
            >
              {displayLanguage}
            </div>
          )}
        </div>

        {children && <div className={FLOATING_ACTIONS_STYLES}>{children}</div>}

        <div className="relative">
          <ScrollArea className="w-full">
            <div className={cn(!isWrapped && 'w-max min-w-full')}>
              {/* Syntax Highlighter Components */}
              <SyntaxHighlighter
                {...SYNTAX_HIGHLIGHTER_COMMON_PROPS}
                className="overflow-hidden dark:hidden"
                customStyle={{
                  margin: 0,
                  background: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))',
                  whiteSpace: isWrapped ? 'pre-wrap' : 'pre',
                }}
                language={language}
                showLineNumbers={showLineNumbers}
                style={oneLight}
                wrapLines={isWrapped}
                wrapLongLines={isWrapped}
              >
                {code}
              </SyntaxHighlighter>

              <SyntaxHighlighter
                {...SYNTAX_HIGHLIGHTER_COMMON_PROPS}
                className="hidden overflow-hidden dark:block"
                customStyle={{
                  margin: 0,
                  background: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))',
                  whiteSpace: isWrapped ? 'pre-wrap' : 'pre',
                }}
                language={language}
                showLineNumbers={showLineNumbers}
                style={nord}
                wrapLines={isWrapped}
                wrapLongLines={isWrapped}
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

  const copyToClipboard = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.clipboard.writeText) {
      const error = new Error('Clipboard API not available');
      onError?.(error);
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      onCopy?.();
      setTimeout(() => setIsCopied(false), timeout);
    } catch (error) {
      console.warn('Failed to copy code to clipboard:', error);
      onError?.(error as Error);
    }
  }, [code, onCopy, onError, timeout]);

  const Icon = isCopied ? CheckIcon : CopyIcon;

  return (
    <Button
      className={cn(`h-7 w-7 ${BUTTON_STYLES}`, className)}
      onClick={copyToClipboard}
      size="icon"
      variant="ghost"
      aria-label={
        isCopied ? 'Code copied to clipboard' : 'Copy code to clipboard'
      }
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

  const downloadCode = useCallback(() => {
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
      console.warn('Failed to download code:', error);
      onError?.(error as Error);
    }
  }, [code, filename, language, onDownload, onError]);

  return (
    <Button
      className={cn(`h-7 w-7 ${BUTTON_STYLES}`, className)}
      onClick={downloadCode}
      size="icon"
      variant="ghost"
      aria-label="Download code as file"
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
      className={cn(`h-7 w-7 ${BUTTON_STYLES}`, className)}
      onClick={toggleWrap}
      size="icon"
      variant="ghost"
      aria-label={isWrapped ? 'Unwrap code lines' : 'Wrap code lines'}
      {...props}
    >
      {children ?? <Icon size={14} />}
    </Button>
  );
};
