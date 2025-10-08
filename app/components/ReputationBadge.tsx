'use client'

import React from 'react'
import { Sprout, Users, Shield, Crown, Trophy } from 'lucide-react'
import { ReputationTier } from '../types/api'

interface ReputationBadgeProps {
  score?: number
  tier?: ReputationTier
  size?: 'sm' | 'md' | 'lg'
  showScore?: boolean
  showLabel?: boolean
}

export default function ReputationBadge({
  score = 0,
  tier = 'newcomer',
  size = 'md',
  showScore = true,
  showLabel = false
}: ReputationBadgeProps) {

  // Determine tier based on score if tier not explicitly provided
  const getTierFromScore = (score: number): ReputationTier => {
    if (score >= 1000) return 'legend'
    if (score >= 500) return 'expert'
    if (score >= 200) return 'veteran'
    if (score >= 100) return 'contributor'
    return 'newcomer'
  }

  const currentTier = tier || getTierFromScore(score)

  // Tier configurations matching backend implementation
  const tierConfig: Record<ReputationTier, {
    icon: any
    color: string
    bgColor: string
    borderColor: string
    label: string
  }> = {
    newcomer: {
      icon: Sprout,
      color: '#9CA3AF',
      bgColor: 'rgba(156, 163, 175, 0.1)',
      borderColor: 'rgba(156, 163, 175, 0.3)',
      label: 'Newcomer'
    },
    contributor: {
      icon: Users,
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      borderColor: 'rgba(16, 185, 129, 0.3)',
      label: 'Contributor'
    },
    veteran: {
      icon: Shield,
      color: '#3B82F6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: 'rgba(59, 130, 246, 0.3)',
      label: 'Veteran'
    },
    expert: {
      icon: Crown,
      color: '#8B5CF6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
      borderColor: 'rgba(139, 92, 246, 0.3)',
      label: 'Expert'
    },
    legend: {
      icon: Trophy,
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      borderColor: 'rgba(245, 158, 11, 0.3)',
      label: 'Legend'
    }
  }

  const config = tierConfig[currentTier]
  const Icon = config.icon

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'px-2 py-1',
      icon: 'w-3 h-3',
      text: 'text-xs',
      gap: 'gap-1'
    },
    md: {
      container: 'px-3 py-1.5',
      icon: 'w-4 h-4',
      text: 'text-sm',
      gap: 'gap-1.5'
    },
    lg: {
      container: 'px-4 py-2',
      icon: 'w-5 h-5',
      text: 'text-base',
      gap: 'gap-2'
    }
  }

  const sizing = sizeConfig[size]

  return (
    <div
      className={`inline-flex items-center ${sizing.container} ${sizing.gap} rounded-full border-2 transition-all duration-200`}
      style={{
        backgroundColor: config.bgColor,
        borderColor: config.borderColor,
      }}
    >
      <Icon
        className={sizing.icon}
        style={{ color: config.color }}
      />
      {showScore && (
        <span
          className={`font-semibold ${sizing.text}`}
          style={{ color: config.color }}
        >
          {score}
        </span>
      )}
      {showLabel && (
        <span
          className={`font-medium ${sizing.text}`}
          style={{ color: config.color }}
        >
          {config.label}
        </span>
      )}
    </div>
  )
}
