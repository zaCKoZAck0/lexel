'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
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
};

const FLOATING_HEADER_STYLES = 'sticky top-0 left-0 z-20';
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

// Map language slugs to file extensions (no labels)
const LANGUAGE_TO_EXTENSION: Record<string, string> = {
  javascript: 'js',
  js: 'js',
  typescript: 'ts',
  ts: 'ts',
  tsx: 'tsx',
  jsx: 'jsx',
  python: 'py',
  py: 'py',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  csharp: 'cs',
  cs: 'cs',
  php: 'php',
  ruby: 'rb',
  rb: 'rb',
  go: 'go',
  rust: 'rs',
  rs: 'rs',
  html: 'html',
  css: 'css',
  scss: 'scss',
  json: 'json',
  xml: 'xml',
  yaml: 'yml',
  yml: 'yml',
  markdown: 'md',
  md: 'md',
  bash: 'sh',
  sh: 'sh',
  sql: 'sql',
  dockerfile: 'dockerfile',
  nginx: 'conf',
  apache: 'conf',
  plaintext: 'txt',
  text: 'txt',
  txt: 'txt',
};

const getFileExtension = (lang: string): string => {
  const key = typeof lang === 'string' ? lang.toLowerCase() : '';
  return LANGUAGE_TO_EXTENSION[key] || 'txt';
};

export const CodeBlock = ({
  code,
  language: initialLanguage,
  showLineNumbers = false,
  className,
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
        <div
          className={`${FLOATING_HEADER_STYLES} flex justify-between items-center w-full p-2`}
        >
          <div
            className={`inline-flex items-center h-6 px-2 py-1 ${BACKDROP_STYLES} text-sm font-medium text-muted-foreground rounded-tr-0 rounded-bl-0`}
          >
            {language}
          </div>
          <div className="flex items-center gap-1">
            <CodeBlockWrapButton />
            <CodeBlockDownloadButton />
            <CodeBlockCopyButton />
          </div>
        </div>

        <div className="relative">
          <ScrollArea className="w-full">
            <div className="w-full">
              {/* Light theme syntax highlighter */}
              <SyntaxHighlighter
                {...SYNTAX_HIGHLIGHTER_COMMON_PROPS}
                className="overflow-hidden dark:hidden"
                customStyle={{
                  margin: 0,
                  background: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))',
                  whiteSpace: isWrapped ? 'pre-wrap' : 'pre',
                  wordBreak: isWrapped ? 'break-all' : 'normal',
                }}
                language={language}
                showLineNumbers={showLineNumbers}
                style={oneLight}
                wrapLines={isWrapped}
                wrapLongLines={isWrapped}
                lineProps={
                  isWrapped
                    ? {
                        style: {
                          wordBreak: 'break-all',
                          whiteSpace: 'pre-wrap',
                          width: '100%',
                        },
                      }
                    : undefined
                }
              >
                {code}
              </SyntaxHighlighter>

              {/* Dark theme syntax highlighter */}
              <SyntaxHighlighter
                {...SYNTAX_HIGHLIGHTER_COMMON_PROPS}
                className="hidden overflow-hidden dark:block"
                customStyle={{
                  margin: 0,
                  background: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))',
                  whiteSpace: isWrapped ? 'pre-wrap' : 'pre',
                  wordBreak: isWrapped ? 'break-all' : 'normal',
                }}
                language={language}
                showLineNumbers={showLineNumbers}
                style={nord}
                wrapLines={isWrapped}
                wrapLongLines={isWrapped}
                lineProps={
                  isWrapped
                    ? {
                        style: {
                          wordBreak: 'break-all',
                          whiteSpace: 'pre-wrap',
                          width: '100%',
                        },
                      }
                    : undefined
                }
              >
                {code}
              </SyntaxHighlighter>
            </div>
            <ScrollBar orientation="horizontal" />
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

      // Use mapped file extension when available; otherwise the raw language or txt
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
