'use client';
import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface LogoProps {
  size?: number;
  animate?: boolean;
  showText?: boolean;
}

export default function Logo({ size = 40, animate = false, showText = true }: LogoProps) {
  const logoVariants = {
    rotating: {
      rotateY: 360,
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "linear" as const
      }
    },
    static: {
      rotateY: 0
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <motion.div
        variants={logoVariants}
        animate={animate ? "rotating" : "static"}
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Image
          src="/logo.png"
          alt="Xleos Logo"
          width={size}
          height={size}
          style={{
            objectFit: 'contain',
          }}
        />
      </motion.div>
      {showText && (
        <Typography
          variant="h6"
          sx={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontWeight: 300,
            fontSize: `${size * 0.4}px`,
            letterSpacing: '0.5px',
            display: { xs: 'none', sm: 'block' }
          }}
        >
          XLEOS
        </Typography>
      )}
    </Box>
  );
}
