'use client'

import { RESOURCE_ICONS, RESOURCE_NAMES, type Resources } from '@/lib/types'

interface ResourceCardProps {
    type: keyof Resources
    amount: number
    rate?: number
    isLow?: boolean
    onClick?: () => void
    compact?: boolean
}

export function ResourceCard({
    type,
    amount,
    rate,
    isLow = false,
    onClick,
    compact = false,
}: ResourceCardProps) {
    const icon = RESOURCE_ICONS[type]
    const name = RESOURCE_NAMES[type]
    const formattedAmount = amount.toLocaleString('es-ES', { maximumFractionDigits: 0 })
    const formattedRate = rate !== undefined
        ? (rate >= 0 ? '+' : '') + rate.toFixed(1) + '/h'
        : null

    if (compact) {
        return (
            <div
                className={`
          flex items-center gap-1.5 px-2 py-1 rounded-lg
          bg-zinc-800/60 border border-zinc-700/50
          ${isLow ? 'border-red-500/50 bg-red-900/20' : ''}
          ${onClick ? 'cursor-pointer hover:bg-zinc-700/60 transition-colors' : ''}
        `}
                onClick={onClick}
            >
                <span className="text-lg">{icon}</span>
                <span className={`font-semibold ${isLow ? 'text-red-400' : 'text-zinc-100'}`}>
                    {formattedAmount}
                </span>
            </div>
        )
    }

    return (
        <div
            className={`
        relative flex flex-col p-3 rounded-xl
        bg-gradient-to-br from-zinc-800/80 to-zinc-900/80
        border border-zinc-700/50
        backdrop-blur-sm
        ${isLow ? 'border-red-500/50 ring-1 ring-red-500/30' : ''}
        ${onClick ? 'cursor-pointer hover:border-amber-500/50 hover:from-zinc-700/80 transition-all' : ''}
      `}
            onClick={onClick}
        >
            {/* Icon and Name */}
            <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{icon}</span>
                <span className="text-sm text-zinc-400 font-medium">{name}</span>
            </div>

            {/* Amount */}
            <div className={`text-xl font-bold ${isLow ? 'text-red-400' : 'text-zinc-100'}`}>
                {formattedAmount}
            </div>

            {/* Rate */}
            {formattedRate && (
                <div className={`text-sm ${rate && rate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formattedRate}
                </div>
            )}

            {/* Low warning indicator */}
            {isLow && (
                <div className="absolute top-2 right-2">
                    <span className="text-red-400 text-xs animate-pulse">⚠️</span>
                </div>
            )}
        </div>
    )
}

// ResourceBar - Compact horizontal display of all resources
interface ResourceBarProps {
    resources: Resources
    rates?: Partial<Resources>
    lowThresholds?: Partial<Resources>
}

export function ResourceBar({ resources, rates, lowThresholds }: ResourceBarProps) {
    const defaultThresholds = { gold: 100, iron: 50, oil: 25, food: 50 }
    const thresholds = { ...defaultThresholds, ...lowThresholds }

    return (
        <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900/90 border-b border-zinc-800 backdrop-blur-md">
            {(Object.keys(resources) as Array<keyof Resources>).map((type) => (
                <ResourceCard
                    key={type}
                    type={type}
                    amount={resources[type]}
                    rate={rates?.[type]}
                    isLow={resources[type] < thresholds[type]}
                    compact
                />
            ))}
        </div>
    )
}

// ResourcePanel - Expanded view with all details
interface ResourcePanelProps {
    resources: Resources
    rates?: Partial<Resources>
}

export function ResourcePanel({ resources, rates }: ResourcePanelProps) {
    return (
        <div className="grid grid-cols-2 gap-3 p-4">
            {(Object.keys(resources) as Array<keyof Resources>).map((type) => (
                <ResourceCard
                    key={type}
                    type={type}
                    amount={resources[type]}
                    rate={rates?.[type]}
                    isLow={resources[type] < 100}
                />
            ))}
        </div>
    )
}
