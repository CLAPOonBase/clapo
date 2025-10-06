'use client'

import React from 'react'
import { Trophy, Award, Star, Crown, Gem } from 'lucide-react'

interface ReputationBadgeProps {
  score?: number
  tier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond'
  size?: 'sm' | 'md' | 'lg'
  showScore?: boolean
  showLabel?: boolean
}

export default function ReputationBadge({
  score = 0,
  tier = 'Bronze',
  size = 'md',
  showScore = true,
  showLabel = false
}: ReputationBadgeProps) {

  // Determine tier based on score if tier not explicitly provided
  const getTierFromScore = (score: number): 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' => {
    if (score >= 800) return 'Diamond'
    if (score >= 600) return 'Platinum'
    if (score >= 400) return 'Gold'
    if (score >= 200) return 'Silver'
    return 'Bronze'
  }

  const currentTier = tier || getTierFromScore(score)

  // Tier configurations
  const tierConfig = {
    Bronze: {
      icon: Award,
      color: '#CD7F32',
      bgColor: 'rgba(205, 127, 50, 0.1)',
      borderColor: 'rgba(205, 127, 50, 0.3)',
      label: 'Bronze'
    },
    Silver: {
      icon: Trophy,
      color: '#C0C0C0',
      bgColor: 'rgba(192, 192, 192, 0.1)',
      borderColor: 'rgba(192, 192, 192, 0.3)',
      label: 'Silver'
    },
    Gold: {
      icon: Star,
      color: '#FFD700',
      bgColor: 'rgba(255, 215, 0, 0.1)',
      borderColor: 'rgba(255, 215, 0, 0.3)',
      label: 'Gold'
    },
    Platinum: {
      icon: Crown,
      color: '#E5E4E2',
      bgColor: 'rgba(229, 228, 226, 0.1)',
      borderColor: 'rgba(229, 228, 226, 0.3)',
      label: 'Platinum'
    },
    Diamond: {
      icon: Gem,
      color: '#B9F2FF',
      bgColor: 'rgba(185, 242, 255, 0.1)',
      borderColor: 'rgba(185, 242, 255, 0.3)',
      label: 'Diamond'
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
