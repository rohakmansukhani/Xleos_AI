"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MathUtils, Mesh, ShaderMaterial, Vector3 } from "three";

const vertexShader: string = `
uniform float u_intensity;
uniform float u_time;
varying vec2 vUv;
varying float vDisplacement;
varying vec3 vNormal;
varying vec3 vPosition;

// Classic Perlin 3D Noise 
// by Stefan Gustavson
vec4 permute(vec4 x) {
    return mod(((x*34.0)+1.0)*x, 289.0);
}
vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
}
vec3 fade(vec3 t) {
    return t*t*t*(t*(t*6.0-15.0)+10.0);
}
float cnoise(vec3 P) {
    vec3 Pi0 = floor(P); // Integer part for indexing
    vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
    Pi0 = mod(Pi0, 289.0);
    Pi1 = mod(Pi1, 289.0);
    vec3 Pf0 = fract(P); // Fractional part for interpolation
    vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;
    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);
    vec4 gx0 = ixy0 / 7.0;
    vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);
    vec4 gx1 = ixy1 / 7.0;
    vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);
    vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
    vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
    vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
    vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
    vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;
    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);
    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
    return 2.2 * n_xyz;
}

void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    
    // Calculate noise displacement
    vDisplacement = cnoise(position + vec3(2.0 * u_time));
    vec3 newPosition = position + normal * (u_intensity * vDisplacement);
    
    // Pass world position for lighting calculations
    vec4 worldPosition = modelMatrix * vec4(newPosition, 1.0);
    vPosition = worldPosition.xyz;
    
    vec4 viewPosition = viewMatrix * worldPosition;
    gl_Position = projectionMatrix * viewPosition;
}
`;

const fragmentShader: string = `
uniform float u_intensity;
uniform float u_time;
uniform vec3 u_lightPosition;
varying vec2 vUv;
varying float vDisplacement;
varying vec3 vNormal;
varying vec3 vPosition;

// Convert hex colors to vec3
vec3 lightPurple = vec3(0.874, 0.694, 1.0);    // #DFB1FF
vec3 darkPurple = vec3(0.294, 0.020, 0.486);   // #4B037C

void main() {
    // Calculate distance from center for radial gradient
    vec2 center = vec2(0.5, 0.5);
    float distanceFromCenter = distance(vUv, center);
    
    // Create radial gradient from light purple (center) to dark purple (edges)
    float gradientFactor = smoothstep(0.0, 0.7, distanceFromCenter);
    vec3 baseColor = mix(lightPurple, darkPurple, gradientFactor);
    
    // Add some noise variation to the gradient
    float noiseVariation = vDisplacement * 0.1;
    baseColor = mix(baseColor, lightPurple * 1.1, noiseVariation);
    
    // Calculate lighting for shine effect
    vec3 lightDirection = normalize(u_lightPosition - vPosition);
    vec3 normal = normalize(vNormal);
    
    // Lambertian (diffuse) lighting
    float diffuse = max(dot(normal, lightDirection), 0.0);
    
    // Specular highlight for shine
    vec3 viewDirection = normalize(-vPosition); // Camera is at origin
    vec3 reflectDirection = reflect(-lightDirection, normal);
    float specular = pow(max(dot(viewDirection, reflectDirection), 0.0), 32.0);
    
    // Enhanced specular for glossy shine effect
    float fresnel = pow(1.0 - max(dot(viewDirection, normal), 0.0), 2.0);
    float shine = specular * 0.8 + fresnel * 0.3;
    
    // Combine lighting with base color
    vec3 ambientLight = baseColor * 0.3;
    vec3 diffuseLight = baseColor * diffuse * 0.7;
    vec3 specularLight = vec3(1.0, 0.9, 1.0) * shine * 0.6; // Slightly purple-tinted shine
    
    vec3 finalColor = ambientLight + diffuseLight + specularLight;
    
    // Add some glow effect based on displacement
    float glow = abs(vDisplacement) * u_intensity * 0.3;
    finalColor += lightPurple * glow;
    
    // Enhance saturation and brightness slightly
    finalColor = mix(finalColor, finalColor * 1.2, 0.3);
    
    gl_FragColor = vec4(finalColor, 1.0);
}
`;

// Internal mesh component that uses useFrame INSIDE Canvas
const Blob3DMesh: React.FC<{ isHovering: boolean }> = ({ isHovering }) => {
  const mesh = useRef<Mesh>(null);
  const { camera } = useThree();

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_intensity: { value: 0.3 },
      u_lightPosition: { value: new Vector3(2, 3, 5) },
    }),
    [],
  );

  useFrame((state) => {
    const { clock } = state;
    if (mesh.current) {
      const material = mesh.current.material as ShaderMaterial;
      material.uniforms.u_time.value = 0.4 * clock.getElapsedTime();

      // Smooth intensity transition on hover
      material.uniforms.u_intensity.value = MathUtils.lerp(
        material.uniforms.u_intensity.value,
        isHovering ? 0.8 : 0.25,
        0.03,
      );

      // Dynamic light position for more realistic lighting
      const time = clock.getElapsedTime() * 0.5;
      material.uniforms.u_lightPosition.value.set(
        Math.cos(time) * 3,
        Math.sin(time * 0.7) * 2 + 2,
        Math.cos(time * 0.5) * 2 + 4,
      );

      // Subtle rotation for more dynamic feel
      mesh.current.rotation.y += 0.005;
      mesh.current.rotation.x = Math.sin(time * 0.3) * 0.1;
    }
  });

  return (
    <mesh ref={mesh} scale={1.4} position={[0, 0, 0]}>
      <icosahedronGeometry args={[2, 24]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};

interface BlobBotProps {
  size?: number;
  colors?: string[];
  mouseFollow?: boolean;
  intensity?: "low" | "medium" | "high";
  interactive?: boolean;
  glowEffect?: boolean;
  className?: string;
  variant?: "default" | "navbar" | "hero" | "minimal";
  onClick?: () => void;
  onHover?: (isHovering: boolean) => void;
}

// Main component that wraps Canvas
const BlobBot: React.FC<BlobBotProps> = ({
  size = 48,
  colors = ["#F259D4", "#8B2B85"], // Magenta-pink to match button
  mouseFollow = true,
  intensity = "medium",
  interactive = true,
  glowEffect = true,
  className = "",
  variant = "default",
  onClick,
  onHover,
}) => {
  const [mounted, setMounted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Size configurations
  const variantConfig = {
    default: { containerSize: 48 },
    navbar: { containerSize: 48 },
    hero: { containerSize: 120 },
    minimal: { containerSize: 24 },
  }[variant];

  const finalSize = variantConfig.containerSize;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseEnter = () => {
    setIsHovering(true);
    onHover?.(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    onHover?.(false);
  };

  // SSR fallback with matching gradient
  if (!mounted) {
    return (
      <div
        className={`blob-container relative cursor-pointer ${className}`}
        style={{
          width: finalSize,
          height: finalSize,
          borderRadius: "50%",
        }}
        suppressHydrationWarning
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: `radial-gradient(circle at 30% 30%, ${colors[0]} 0%, ${colors[1]} 100%)`,
            opacity: 0.9,
            boxShadow: `0 0 20px ${colors[1]}40, inset 0 0 20px ${colors[0]}30`,
          }}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`blob-container relative cursor-pointer select-none ${className}`}
      style={{
        width: finalSize,
        height: finalSize,
        willChange: interactive ? "transform" : "auto",
        transform: isHovering ? "scale(1.05)" : "scale(1)",
        transition: "transform 0.3s ease-out",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      role={interactive ? "button" : "img"}
      aria-label="Interactive 3D blob animation"
      tabIndex={interactive ? 0 : -1}
    >
      {/* Glow effect background */}
      {glowEffect && (
        <div
          className="absolute inset-0 rounded-full blur-lg opacity-40 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${colors[0]}80 0%, ${colors[1]}60 40%, transparent 70%)`,
            transform: "scale(1.2)",
            transition: "opacity 0.3s ease",
            opacity: isHovering ? 0.6 : 0.3,
          }}
        />
      )}

      {/* Main 3D Canvas */}
      <div className="relative w-full h-full rounded-full overflow-hidden">
        <Canvas
          camera={{ position: [0.0, 0.0, 8.0], fov: 45 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
        >
          <ambientLight intensity={0.2} />
          <pointLight position={[2, 3, 5]} intensity={0.8} />
          <Blob3DMesh isHovering={isHovering} />
        </Canvas>
      </div>

      {/* Interactive overlay for better accessibility */}
      {interactive && (
        <div
          className={`absolute inset-0 rounded-full border transition-all duration-300 pointer-events-none ${
            isHovering
              ? "border-white/20 bg-white/5"
              : "border-white/5 bg-transparent"
          }`}
          style={{
            backdropFilter: isHovering ? "blur(2px)" : "none",
          }}
        />
      )}
    </div>
  );
};

export default BlobBot;
