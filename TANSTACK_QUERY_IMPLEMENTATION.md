# TanStack React Query Implementation for API Keys

This implementation provides a production-ready TanStack React Query setup for managing API keys with your existing Prisma database schema.

## �️ File Structure

```
lib/
├── query-client.ts           # Query client configuration
├── types/api-keys.ts         # Type definitions using Prisma types
├── api/keys.ts              # API service functions
└── query-utils.ts           # Utility functions

hooks/
└── use-api-keys.ts          # React Query hooks for API keys

components/
├── providers.tsx            # Updated with QueryClientProvider
├── query-error-boundary.tsx # Error boundary for queries
└── account/
    └── api-keys.tsx         # Clean, production-ready component
```

## 🎯 Key Features

### Production-Ready Configuration
- ✅ 5-minute stale time for optimal caching
- ✅ Exponential backoff retry strategy
- ✅ Smart error handling (no retry on 4xx errors)
- ✅ Background refetching on window focus
- ✅ Proper TypeScript types throughout

### Optimistic Updates
- ✅ Instant UI feedback for all mutations
- ✅ Automatic rollback on errors
- ✅ Cache invalidation and synchronization
- ✅ Toast notifications for user feedback

### Prisma Integration
- ✅ Uses Prisma-generated `ApiKeys` type
- ✅ No redundant type definitions
- ✅ Matches your existing database schema
- ✅ Proper relation handling

The `components/providers.tsx` has been updated to include QueryClientProvider:

```tsx
"use client"

import { SessionProvider } from "next-auth/react"
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/query-client'

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <QueryClientProvider client={queryClient}>
                {children}
                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
        </SessionProvider>
    )
}
```

## 🎯 Usage Examples

### Basic Query Usage

```tsx
import { useApiKeys } from '@/hooks/use-api-keys'

function ApiKeysList() {
  const { data: keys, isLoading, error } = useApiKeys()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading keys</div>
  
  return (
    <div>
      {keys?.map(key => (
        <div key={key.id}>{key.provider}: {key.key}</div>
      ))}
    </div>
  )
}
```

### Mutation with Optimistic Updates

```tsx
import { useCreateApiKey } from '@/hooks/use-api-keys'

function CreateKeyForm() {
  const createMutation = useCreateApiKey()

  const handleSubmit = async (data) => {
    try {
      await createMutation.mutateAsync(data)
      // Success handled automatically with toast
    } catch (error) {
      // Error handled automatically with toast and rollback
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button 
        disabled={createMutation.isPending}
        type="submit"
      >
        {createMutation.isPending ? 'Creating...' : 'Create Key'}
      </button>
    </form>
  )
}
```

### Comprehensive Operations Hook

```tsx
import { useApiKeyOperations } from '@/hooks/use-api-keys'

function ApiKeyManager() {
  const {
    createKey,
    updateKey,
    deleteKey,
    setDefaultKey,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isSettingDefault
  } = useApiKeyOperations()

  // All operations return promises and handle errors automatically
  const handleCreate = () => createKey({ provider: 'openai', key: 'sk-...', default: false })
  const handleUpdate = () => updateKey('key-id', { provider: 'anthropic' })
  const handleDelete = () => deleteKey('key-id')
  const handleSetDefault = () => setDefaultKey('key-id')
}
```

## 🔧 Configuration Options

### Query Client Configuration

The query client in `lib/query-client.ts` is configured with production-ready defaults:

```tsx
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,        // 5 minutes
      gcTime: 10 * 60 * 1000,          // 10 minutes
      retry: 3,                        // Retry 3 times
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,                        // Retry mutations once
      retryDelay: 1000,
    },
  },
})
```

### API Service Configuration

The API service in `lib/api/keys.ts` includes:

- Custom error handling with `ApiRequestError` class
- Proper TypeScript typing for all responses
- Automatic JSON parsing with fallback to text
- Network error handling

## 🛡 Error Handling

### Error Boundary

Wrap components with the provided error boundary:

```tsx
import { QueryErrorBoundary } from '@/components/query-error-boundary'

function MyComponent() {
  return (
    <QueryErrorBoundary>
      <ApiKeysList />
    </QueryErrorBoundary>
  )
}
```

### Custom Error Handling

```tsx
const { error } = useApiKeys()

if (error instanceof ApiRequestError) {
  // Handle specific HTTP errors
  if (error.status === 401) {
    // Handle unauthorized
  } else if (error.status === 429) {
    // Handle rate limiting
  }
}
```

## 📊 DevTools

The React Query DevTools are included in development mode. Open your browser's developer tools and look for the React Query panel to:

- Monitor query states (fresh, stale, fetching)
- View cached data
- Trigger manual refetches
- Debug mutations

## 🎨 Components

### Two Implementation Options

1. **Enhanced Component** (`ApiKeysManager`): Built from scratch with modern patterns
2. **Updated Original** (`ApiKeys`): Your existing component updated to use React Query

Both components include:
- Loading states with skeletons
- Error handling with retry options
- Optimistic updates
- Toast notifications
- Proper accessibility

## Production Considerations

### Performance
- Queries are cached and shared across components
- Background updates minimize user interruption
- Optimistic updates provide instant feedback

### User Experience
- Loading states prevent layout shifts
- Error boundaries provide graceful fallbacks
- Toast notifications keep users informed

### Developer Experience
- Full TypeScript support
- DevTools for debugging
- Comprehensive error handling
- Consistent API patterns

## Best Practices

1. **Use Error Boundaries**: Always wrap query components with error boundaries
2. **Handle Loading States**: Provide proper loading indicators
3. **Implement Optimistic Updates**: For better perceived performance
4. **Configure Retry Logic**: Based on your API characteristics
5. **Use Proper Query Keys**: For effective caching and invalidation
6. **Type Everything**: Leverage TypeScript for better DX

## Additional Resources

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [React Query Best Practices](https://tkdodo.eu/blog/practical-react-query)
- [Optimistic Updates Guide](https://tanstack.com/query/v5/docs/react/guides/optimistic-updates)

This implementation provides a solid foundation for any production application requiring robust data fetching and mutation handling.
