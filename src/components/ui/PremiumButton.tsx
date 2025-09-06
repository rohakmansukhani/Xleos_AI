'use client'
import React, { useRef, useState, memo, forwardRef } from "react"
import { Loader2 } from "lucide-react"
import { motion, AnimatePresence, easeInOut } from "framer-motion"

type ButtonVariant = 
  | 'primary' | 'secondary' | 'ghost' | 'gradient' | 'glass'
  | 'outline' | 'danger' | 'success'
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type ButtonAnimation = 
  | 'magnetic' | 'ripple' | 'glow' | 'scale' | 'pulse' | 'shimmer'

interface PremiumButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size' | 'onClick'> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  animations?: ButtonAnimation[]
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  className?: string
  children: React.ReactNode
  href?: string
  target?: string
  rel?: string
  onClick?: (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void
}

const sizeConfig = {
  xs: { padding: 'px-3 py-1.5', fontSize: 'text-xs', height: 'h-7', iconSize: 14 },
  sm: { padding: 'px-4 py-2', fontSize: 'text-sm', height: 'h-8', iconSize: 16 },
  md: { padding: 'px-6 py-3', fontSize: 'text-sm', height: 'h-10', iconSize: 18 },
  lg: { padding: 'px-8 py-4', fontSize: 'text-base', height: 'h-12', iconSize: 20 },
  xl: { padding: 'px-10 py-5', fontSize: 'text-lg', height: 'h-14', iconSize: 22 }
}

const variantConfig = {
  primary: {
    base: 'bg-gradient-to-r from-[#7c5dfa] to-[#bb80ff] text-white',
    hover: 'hover:from-[#927dfc] hover:to-[#bd93fa]',
    active: 'active:from-[#916afc] active:to-[#a792f4]',
    disabled: 'disabled:from-gray-600 disabled:to-gray-700',
    shadow: 'shadow-lg shadow-[#7c5dfa33]',
    border: ''
  },
  secondary: {
    base: 'bg-white/10 text-white',
    hover: 'hover:bg-white/20',
    active: 'active:bg-white/30',
    disabled: 'disabled:bg-gray-600/50',
    shadow: 'shadow-lg shadow-black/25',
    border: 'border border-white/20'
  },
  ghost: {
    base: 'bg-transparent text-white',
    hover: 'hover:bg-white/10',
    active: 'active:bg-white/20',
    disabled: 'disabled:text-gray-500',
    shadow: '',
    border: ''
  },
  gradient: {
    base: 'bg-gradient-to-r from-[#ac7efc] via-[#7c5dfa] to-[#bb80ff] text-white',
    hover: 'hover:from-[#b5a3fb] hover:via-[#b1aefc] hover:to-[#af84fc]',
    active: 'active:from-[#a598fc] active:to-[#b789fb]',
    disabled: 'disabled:from-gray-600 disabled:to-gray-700',
    shadow: 'shadow-xl shadow-[#7c5dfa33]',
    border: ''
  },
  glass: {
    base: 'bg-white/5 backdrop-blur-xl text-white',
    hover: 'hover:bg-white/10',
    active: 'active:bg-white/15',
    disabled: 'disabled:bg-gray-600/20',
    shadow: 'shadow-lg shadow-black/20',
    border: 'border border-white/20'
  },
  outline: {
    base: 'bg-transparent text-[#b68bfb]',
    hover: 'hover:bg-[#bfa2f110] hover:text-[#b7a8fa]',
    active: 'active:bg-[#cfc2fa33]',
    disabled: 'disabled:text-gray-500 disabled:border-gray-600',
    shadow: '',
    border: 'border-2 border-[#b68bfb]'
  },
  danger: {
    base: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
    hover: 'hover:from-red-400 hover:to-red-500',
    active: 'active:from-red-600 active:to-red-700',
    disabled: 'disabled:from-gray-600 disabled:to-gray-700',
    shadow: 'shadow-lg shadow-red-500/25',
    border: ''
  },
  success: {
    base: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
    hover: 'hover:from-green-400 hover:to-green-500',
    active: 'active:from-green-600 active:to-green-700',
    disabled: 'disabled:from-gray-600 disabled:to-gray-700',
    shadow: 'shadow-lg shadow-green-500/25',
    border: ''
  }
}

const tapAnim = { scale: 0.96 }
const pulseAnim = { 
  scale: [1, 1.06, 1], 
  transition: { duration: 1.4, repeat: Infinity, ease: easeInOut }
}

const PremiumButton = memo(forwardRef<HTMLButtonElement, PremiumButtonProps>(function PremiumButtonRaw({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  animations = [],
  icon,
  iconPosition = 'left',
  className = '',
  children,
  href,
  target,
  rel,
  onClick,
  ...props
}, ref) {
  const btnRef = useRef<HTMLButtonElement>(null)
  const [isMagnetic, setIsMagnetic] = useState(false)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [ripples, setRipples] = useState<{ x: number, y: number, key: number }[]>([])

  const sizeStyles = sizeConfig[size]
  const variantStyles = variantConfig[variant]

  function handlePointerMove(e: React.PointerEvent<HTMLElement>) {
    if (!animations.includes('magnetic') || disabled || loading) return;
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2)
    const y = e.clientY - (rect.top + rect.height / 2)
    setOffset({ x: x * 0.18, y: y * 0.18 })
    setIsMagnetic(true)
  }
  function handlePointerLeave() {
    setOffset({ x: 0, y: 0 })
    setIsMagnetic(false)
  }

  function handleRipple(e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement, MouseEvent>) {
    if (!animations.includes('ripple') || disabled || loading) return;
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setRipples((prev) => [...prev, { x, y, key: Date.now() }])
    setTimeout(() => setRipples(prev => prev.slice(1)), 520)
  }

  const pulse = animations.includes("pulse") ? pulseAnim : undefined

  const baseClasses = [
    'relative overflow-hidden font-semibold transition-all duration-300',
    'focus:outline-none focus:ring-2 focus:ring-[#af92fb4b]',
    'disabled:cursor-not-allowed disabled:opacity-50',
    sizeStyles.padding,
    sizeStyles.fontSize,
    sizeStyles.height,
    variantStyles.base,
    variantStyles.hover,
    variantStyles.active,
    variantStyles.disabled,
    variantStyles.shadow,
    variantStyles.border,
    fullWidth ? 'w-full !block' : 'inline-flex items-center justify-center',
    'rounded-xl', className
  ].filter(Boolean).join(' ')

  const shimmerStyle = animations.includes('shimmer')
    ? { background: 'linear-gradient(90deg,#fff0,rgba(255,255,255,0.08),#fff0)', backgroundSize: '200% 100%', backgroundPosition: isMagnetic ? "230% 0" : "-200% 0" }
    : {}

  const motionProps = {
    ...(pulse ? { animate: pulse } : {}),
    initial: pulse ? { scale: 1 } : undefined,
    whileTap: tapAnim,
    style: {
      ...shimmerStyle,
      ...(animations.includes('magnetic') && isMagnetic ? {
        x: offset.x, y: offset.y
      } : { x: 0, y: 0 }),
    },
    whileHover: animations.includes('scale') ? { scale: 1.04 } : undefined,
    transition: { type: "spring" as const, stiffness: 280 }
  }

  const content = (
    <>
      {animations.includes('glow') && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-xl opacity-20 z-[1]"
          initial={{ scale: 1, opacity: 0.18 }}
          animate={isMagnetic ? { scale: 1.18, opacity: 0.37 } : { scale: 1.07, opacity: 0.16 }}
          style={{
            background: variant === "gradient" || variant === "primary"
              ? 'linear-gradient(135deg,#8157eb,#beacf7 55%)'
              : 'rgba(255,255,255,0.08)'
          }}
          transition={{ duration: 0.36 }}
        />
      )}
      {animations.includes('ripple') &&
        <span className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl z-[2]">
          <AnimatePresence>
            {ripples.map(ripple => (
              <motion.span
                key={ripple.key}
                className="absolute block rounded-full bg-white/40"
                style={{
                  left: ripple.x - 100,
                  top: ripple.y - 100,
                  width: 200,
                  height: 200
                }}
                initial={{ scale: 0.18, opacity: 0.22 }}
                animate={{ scale: 1, opacity: 0.04 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            ))}
          </AnimatePresence>
        </span>
      }
      <span className="relative z-[5] flex items-center justify-center gap-2">
        {loading ? (
          <Loader2 size={sizeStyles.iconSize} className="animate-spin" />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <span className="inline-flex" style={{ fontSize: sizeStyles.iconSize }}>
                {icon}
              </span>
            )}
            <span>{children}</span>
            {icon && iconPosition === 'right' && (
              <span className="inline-flex" style={{ fontSize: sizeStyles.iconSize }}>
                {icon}
              </span>
            )}
          </>
        )}
      </span>
    </>
  );

  if (href) {
    return (
      <motion.a
        href={href}
        target={target}
        rel={rel}
        className={baseClasses}
        {...motionProps}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={e => {
          if (animations.includes("ripple")) handleRipple(e);
          if (onClick) onClick(e);
        }}
      >
        {content}
      </motion.a>
    )
  }

  const {
    onDrag, onDragEnd, onDragStart, onAnimationStart,
    onAnimationEnd, onAnimationIteration, ...restProps
  } = props;

  return (
    <motion.button
      ref={ref ? ref : btnRef}
      type="button"
      className={baseClasses}
      disabled={disabled || loading}
      {...motionProps}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={e => {
        if (animations.includes("ripple")) handleRipple(e);
        if (onClick) onClick(e);
      }}
      {...restProps}
    >
      {content}
    </motion.button>
  );
}));

PremiumButton.displayName = 'PremiumButton';
export default PremiumButton;
