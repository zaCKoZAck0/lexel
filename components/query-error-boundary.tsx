'use client';

import React, { ErrorInfo } from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <CardTitle>Something went wrong</CardTitle>
        <CardDescription>
          An unexpected error occurred while loading this component.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <details className="text-sm text-left">
          <summary className="cursor-pointer text-muted-foreground mb-2">
            Error details
          </summary>
          <pre className="whitespace-pre-wrap bg-muted p-3 rounded text-xs overflow-auto max-h-32">
            {error.message}
          </pre>
        </details>
        <Button onClick={resetErrorBoundary} className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}

interface QueryErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

export function QueryErrorBoundary({
  children,
  fallback: Fallback = ErrorFallback,
}: QueryErrorBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          FallbackComponent={Fallback}
          onReset={reset}
          onError={(error: Error, errorInfo: ErrorInfo) => {
            // Log error to your error reporting service
            console.error(
              'Query Error Boundary caught an error:',
              error,
              errorInfo,
            );
          }}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
