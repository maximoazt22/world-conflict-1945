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
    // Helper for realistic resource formatting
    const formatResource = (val: number) => {
        if (Math.abs(val) >= 1000000) return `${(val / 1000000).toFixed(1)}m`
        if (Math.abs(val) >= 1000) return `${(val / 1000).toFixed(1)}k`
        return val.toString()
    }

    const icon = RESOURCE_ICONS[type]
    const name = RESOURCE_NAMES[type]
    const formattedAmount = formatResource(amount)
    const formattedRate = rate !== undefined
        ? (rate >= 0 ? '+' : '') + formatResource(rate) + '/h'
        : null

    if (compact) {
        return (
            <div
                className={`
          flex items-center gap-1.5 px-2 py-1 rounded-lg
          bg-white/5 border border-white/10
          ${isLow ? 'border-alert-red/50 bg-alert-red/10' : ''}
          ${onClick ? 'cursor-pointer hover:bg-white/10 transition-colors' : ''}
        `}
                onClick={onClick}
            >
                <span className="text-lg opacity-80">{icon}</span>
                <span className={`font-mono font-bold text-sm ${isLow ? 'text-alert-red' : 'text-zinc-100'}`}>
                    {formattedAmount}
                </span>
            </div>
        )
    }

    return (
        <div
            className={`
        relative flex flex-col p-3 rounded-xl
        glass-panel
        ${isLow ? 'border-alert-red/50 ring-1 ring-alert-red/30' : ''}
        ${onClick ? 'cursor-pointer hover:border-primary/50 hover:bg-white/5 transition-all' : ''}
      `}
            onClick={onClick}
        >
            {/* Icon and Name */}
            <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{icon}</span>
                <span className="text-sm text-zinc-400 font-bold uppercase tracking-wider">{name}</span>
            </div>

            {/* Amount */}
            <div className={`text-xl font-mono font-bold ${isLow ? 'text-alert-red' : 'text-white'}`}>
                {formattedAmount}
            </div>

            {/* Rate */}
            {formattedRate && (
                <div className={`text-sm font-mono ${rate && rate >= 0 ? 'text-green-400' : 'text-alert-red'}`}>
                    {formattedRate}
                </div>
            )}

            {/* Low warning indicator */}
            {isLow && (
                <div className="absolute top-2 right-2">
                    <span className="text-alert-red text-xs animate-pulse">⚠️</span>
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
    const defaultThresholds: Partial<Resources> = { gold: 100, steel: 50, oil: 25, food: 50 }
    const thresholds = { ...defaultThresholds, ...lowThresholds }

    return (
        <div className="flex items-center gap-3 px-4 py-2">
            {(Object.keys(resources) as Array<keyof Resources>).filter(type => resources[type] !== undefined).map((type) => (
                <ResourceCard
                    key={type}
                    type={type}
                    amount={resources[type] ?? 0}
                    rate={rates?.[type]}
                    isLow={(resources[type] ?? 0) < (thresholds[type] ?? 100)}
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
            {(Object.keys(resources) as Array<keyof Resources>).filter(type => resources[type] !== undefined).map((type) => {
                const amt = resources[type] as number
                return (
                    <ResourceCard
                        key={type}
                        type={type}
                        amount={amt}
                        rate={rates?.[type]}
                        isLow={amt < 100}
                    />
                )
            })}
        </div>
    )
}
