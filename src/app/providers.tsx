'use client'

import { useQueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import { QueryClient } from '@tanstack/react-query'

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000, // 1 minute
                refetchOnWindowFocus: false,
            },
        },
    })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
    if (typeof window === 'undefined') {
        return makeQueryClient()
    }
    if (!browserQueryClient) {
        browserQueryClient = makeQueryClient()
    }
    return browserQueryClient
}

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => getQueryClient())

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
    )
}
