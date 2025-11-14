import { Button as ChakraButton, Icon } from '@chakra-ui/react'
import React from 'react'

interface CustomButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  leftIcon?: React.ElementType
  rightIcon?: React.ElementType
  isLoading?: boolean
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  [key: string]: any
}

/**
 * CustomButton Component
 * Modern, styled button with multiple variants
 */
export function CustomButton({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  isLoading = false,
  children,
  disabled = false,
  ...props
}: CustomButtonProps) {
  const variants: Record<string, any> = {
    primary: {
      background: 'linear-gradient(135deg, #0E7C86 0%, #14B8A6 100%)',
      color: 'white',
      _hover: !disabled ? {
        opacity: 0.9,
        transform: 'translateY(-2px)',
        boxShadow: 'lg',
      } : {},
      _active: !disabled ? {
        transform: 'translateY(0)',
      } : {},
    },
    secondary: {
      background: 'gray.100',
      color: 'gray.900',
      _dark: {
        background: 'gray.800',
        color: 'white',
      },
      _hover: !disabled ? {
        background: 'gray.200',
        transform: 'translateY(-2px)',
      } : {},
    },
    outline: {
      borderWidth: '2px',
      borderColor: 'teal.500',
      color: 'teal.600',
      _hover: !disabled ? {
        background: 'teal.50',
        transform: 'translateY(-2px)',
      } : {},
      _dark: {
        color: 'teal.300',
        _hover: !disabled ? {
          background: 'rgba(20, 184, 166, 0.1)',
        } : {},
      },
    },
    ghost: {
      color: 'teal.600',
      _hover: !disabled ? {
        background: 'gray.100',
      } : {},
      _dark: {
        _hover: !disabled ? {
          background: 'gray.800',
        } : {},
      },
    },
    danger: {
      background: '#EF4444',
      color: 'white',
      _hover: !disabled ? {
        background: '#DC2626',
        transform: 'translateY(-2px)',
      } : {},
    },
  }

  const sizes: Record<string, any> = {
    sm: {
      height: '32px',
      px: '12px',
      fontSize: '0.875rem',
      fontWeight: 500,
    },
    md: {
      height: '40px',
      px: '16px',
      fontSize: '1rem',
      fontWeight: 500,
    },
    lg: {
      height: '48px',
      px: '24px',
      fontSize: '1.125rem',
      fontWeight: 600,
    },
  }

  return (
    <ChakraButton
      {...variants[variant]}
      {...sizes[size]}
      borderRadius="0.75rem"
      transition="all 0.3s ease"
      loading={isLoading}
      disabled={disabled || isLoading}
      _disabled={{
        opacity: 0.5,
        cursor: 'not-allowed',
        transform: 'none',
      }}
      _focus={{
        outline: 'none',
      }}
      _focusVisible={{
        outline: '2px solid',
        outlineColor: 'teal.500',
        outlineOffset: '2px',
      }}
      {...props}
    >
      {leftIcon && <Icon as={leftIcon} mr={2} />}
      {children}
      {rightIcon && <Icon as={rightIcon} ml={2} />}
    </ChakraButton>
  )
}
