'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'

interface AnimatedCardProps {
  children: React.ReactNode
  delay?: number
}

export function AnimatedCard({ children, delay = 0 }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

interface ShimmerProps {
  children: React.ReactNode
}

export function Shimmer({ children }: ShimmerProps) {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {children}
    </motion.div>
  )
}

interface PulseProps {
  children: React.ReactNode
  color?: string
}

export function Pulse({ children, color = '#00E5D4' }: PulseProps) {
  return (
    <motion.div
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
      style={{ transformOrigin: 'center' }}
    >
      {children}
    </motion.div>
  )
}

interface SlideInProps {
  children: React.ReactNode
  direction?: 'left' | 'right' | 'up' | 'down'
  delay?: number
}

export function SlideIn({ children, direction = 'left', delay = 0 }: SlideInProps) {
  const variants = {
    left: { initial: { x: -50, opacity: 0 }, animate: { x: 0, opacity: 1 } },
    right: { initial: { x: 50, opacity: 0 }, animate: { x: 0, opacity: 1 } },
    up: { initial: { y: 50, opacity: 0 }, animate: { y: 0, opacity: 1 } },
    down: { initial: { y: -50, opacity: 0 }, animate: { y: 0, opacity: 1 } },
  }

  return (
    <motion.div
      variants={variants[direction]}
      initial="initial"
      animate="animate"
      transition={{ delay, duration: 0.4 }}
    >
      {children}
    </motion.div>
  )
}

interface StaggerContainerProps {
  children: React.ReactNode
  staggerDelay?: number
}

export function StaggerContainer({ children, staggerDelay = 0.1 }: StaggerContainerProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {Array.isArray(children) ? (
        children.map((child, i) => (
          <motion.div key={i} variants={itemVariants}>
            {child}
          </motion.div>
        ))
      ) : (
        <motion.div variants={itemVariants}>{children}</motion.div>
      )}
    </motion.div>
  )
}

interface NumberCounterProps {
  from: number
  to: number
  duration?: number
  decimals?: number
}

export function NumberCounter({ from, to, duration = 1, decimals = 0 }: NumberCounterProps) {
  const [displayValue, setDisplayValue] = useState(from)

  return (
    <motion.div
      onViewportEnter={() => {
        const diff = to - from
        const step = (diff / (duration * 60)) // 60fps
        let current = from

        const interval = setInterval(() => {
          current += step
          if ((step > 0 && current >= to) || (step < 0 && current <= to)) {
            setDisplayValue(to)
            clearInterval(interval)
          } else {
            setDisplayValue(Number(current.toFixed(decimals)))
          }
        }, 16)
      }}
    >
      {displayValue.toFixed(decimals)}
    </motion.div>
  )
}
