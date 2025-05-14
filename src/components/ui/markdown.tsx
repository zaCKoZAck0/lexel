import { FC, memo } from 'react'
import ReactMarkdown, { Options } from 'react-markdown'

interface MarkdownProps extends Options {
  className?: string
}

export const MemoizedReactMarkdown: FC<MarkdownProps> = memo(
  ReactMarkdown,
  (prevProps: MarkdownProps, nextProps: MarkdownProps) =>
      prevProps.children === nextProps.children &&
      prevProps.rehypePlugins === nextProps.rehypePlugins &&
      prevProps.remarkPlugins === nextProps.remarkPlugins
)