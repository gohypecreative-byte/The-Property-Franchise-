// src/components/hero/three.tsx
// 3D building blocks for the hero flight: starfield, nebula glow, rocket and Earth.
"use client";

import React, { forwardRef, useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

// Small seeded generator (mulberry32) so the starfield is deterministic
function seededRandom(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Soft radial glow used for nebula clouds
function createGlowTexture(colour: string, size = 256) {
  const n = parseInt(colour.replace("#", ""), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, `rgba(${r},${g},${b},0.9)`);
  grad.addColorStop(0.35, `rgba(${r},${g},${b},0.35)`);
  grad.addColorStop(0.7, `rgba(${r},${g},${b},0.08)`);
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* --------------------------------- Starfield -------------------------------- */

interface StarfieldProps {
  count?: number;
  depth?: number;
  spread?: number;
  /** Units per second along +z. A ref lets the parent change it per frame. */
  speed?: number | RefObject<number>;
  size?: number;
  colour?: string;
  opacity?: number;
}

export function Starfield({
  count = 3000,
  depth = 180,
  spread = 110,
  speed = 4,
  size = 0.14,
  colour = "#F7F9FC",
  opacity = 0.85,
}: StarfieldProps) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const rand = seededRandom(count * 7919 + Math.round(spread * 31 + depth));
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (rand() - 0.5) * spread;
      arr[i * 3 + 1] = (rand() - 0.5) * spread;
      arr[i * 3 + 2] = -rand() * depth;
    }
    return arr;
  }, [count, depth, spread]);

  useFrame((state, delta) => {
    const points = ref.current;
    if (!points) return;
    const v = typeof speed === "number" ? speed : (speed.current ?? 0);
    const attr = points.geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const limit = state.camera.position.z + 2;
    const step = Math.min(v * delta, depth * 0.5);
    for (let i = 0; i < count; i++) {
      let z = arr[i * 3 + 2] + step;
      if (z > limit) {
        z -= depth;
        arr[i * 3] = (Math.random() - 0.5) * spread;
        arr[i * 3 + 1] = (Math.random() - 0.5) * spread;
      }
      arr[i * 3 + 2] = z;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={size} color={colour} transparent opacity={opacity} sizeAttenuation depthWrite={false} />
    </points>
  );
}

/* ---------------------------------- Nebula ---------------------------------- */

const CLOUDS: { position: [number, number, number]; scale: number; colour: string; opacity: number }[] = [
  { position: [-40, 18, -150], scale: 120, colour: "#1E3F9A", opacity: 0.32 },
  { position: [38, -22, -170], scale: 140, colour: "#012169", opacity: 0.3 },
  { position: [10, 30, -190], scale: 90, colour: "#E4002B", opacity: 0.14 },
];

export function Nebula() {
  const textures = useMemo(() => CLOUDS.map((c) => createGlowTexture(c.colour)), []);
  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures]);

  return (
    <group>
      {CLOUDS.map((c, i) => (
        <sprite key={i} position={c.position} scale={[c.scale, c.scale, 1]}>
          <spriteMaterial
            map={textures[i]}
            transparent
            opacity={c.opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      ))}
    </group>
  );
}

/* ---------------------------------- Rocket ---------------------------------- */

const HULL = "#F2F4F8";
const TRIM = "#012169";
const EMBER = "#E4002B";

type RocketProps = ThreeElements["group"] & {
  /** 0 = engine off, 1 = cruising, 2 = full burn */
  flame?: number;
};

// A slim rocket in white with flag-blue trim and a red band. Nose points along +Y.
export const Rocket = forwardRef<THREE.Group, RocketProps>(function Rocket({ flame = 1, ...props }, ref) {
  const flameRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const fin = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, -0.2);
    s.lineTo(0, 1.1);
    s.lineTo(0.72, -0.25);
    s.lineTo(0.72, -0.5);
    s.lineTo(0.12, -0.5);
    s.closePath();
    return s;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const flicker = 1 + Math.sin(t * 38) * 0.12 + Math.sin(t * 23.7) * 0.08;
    if (flameRef.current) flameRef.current.scale.set(1, flicker * flame, 1);
    if (coreRef.current) coreRef.current.scale.set(1, (0.85 + 0.25 * Math.sin(t * 51)) * flame, 1);
    if (lightRef.current) lightRef.current.intensity = 2.2 * flicker * flame;
  });

  return (
    <group ref={ref} {...props}>
      <mesh>
        <cylinderGeometry args={[0.4, 0.5, 3.6, 40]} />
        <meshStandardMaterial color={HULL} roughness={0.45} metalness={0.25} />
      </mesh>
      <mesh position={[0, 2.6, 0]}>
        <coneGeometry args={[0.4, 1.7, 40]} />
        <meshStandardMaterial color={HULL} roughness={0.45} metalness={0.25} />
      </mesh>
      <mesh position={[0, 1.55, 0]}>
        <cylinderGeometry args={[0.425, 0.43, 0.34, 40]} />
        <meshStandardMaterial color={TRIM} roughness={0.5} metalness={0.1} />
      </mesh>
      <mesh position={[0, -0.75, 0]}>
        <cylinderGeometry args={[0.478, 0.485, 0.06, 40]} />
        <meshStandardMaterial color={EMBER} roughness={0.5} />
      </mesh>
      <mesh position={[0, -1.55, 0]}>
        <cylinderGeometry args={[0.495, 0.5, 0.12, 40]} />
        <meshStandardMaterial color={TRIM} roughness={0.5} metalness={0.1} />
      </mesh>

      {[0.75, 0.15].map((y, i) => (
        <group key={i} position={[0, y, 0.43]}>
          <mesh>
            <torusGeometry args={[0.11, 0.025, 10, 24]} />
            <meshStandardMaterial color={TRIM} metalness={0.3} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0, -0.005]}>
            <circleGeometry args={[0.1, 24]} />
            <meshStandardMaterial color="#8fa4e0" emissive="#8fa4e0" emissiveIntensity={0.7} />
          </mesh>
        </group>
      ))}

      {[0, 1, 2, 3].map((i) => (
        <group key={i} rotation={[0, (i * Math.PI) / 2 + Math.PI / 4, 0]}>
          <mesh position={[0.4, -1.3, -0.03]}>
            <extrudeGeometry args={[fin, { depth: 0.06, bevelEnabled: false }]} />
            <meshStandardMaterial color={TRIM} roughness={0.5} metalness={0.1} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, -2.0, 0]}>
        <cylinderGeometry args={[0.3, 0.42, 0.45, 32]} />
        <meshStandardMaterial color="#0A1633" metalness={0.8} roughness={0.3} />
      </mesh>
      <group ref={flameRef} position={[0, -2.22, 0]}>
        <mesh position={[0, -0.7, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.27, 1.4, 20]} />
          <meshBasicMaterial color={EMBER} transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>
      <group ref={coreRef} position={[0, -2.22, 0]}>
        <mesh position={[0, -0.45, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.14, 0.9, 16]} />
          <meshBasicMaterial color="#fff4d6" transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>
      <pointLight ref={lightRef} position={[0, -2.6, 0]} color={EMBER} intensity={2.2} distance={12} decay={2} />
    </group>
  );
});

/* ----------------------------------- Earth ---------------------------------- */

interface FlightProps {
  progress: RefObject<number>;
  mobile: boolean;
}

// A photograph of Earth on a billboard, far back. Additive blending drops the
// black sky of the still into the scene background.
export function Earth({ progress, mobile }: FlightProps) {
  const map = useTexture("/images/space-earth.jpg");
  map.colorSpace = THREE.SRGBColorSpace;
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const p = progress.current ?? 0;
    const m = mesh.current;
    if (!m) return;
    const size = mobile ? 54 : 62;
    m.scale.setScalar(size * (1 + 0.12 * p));
    m.position.set(mobile ? -8 - p * 16 : -30 - p * 22, mobile ? 14 + p * 6 : 4 + p * 6, -90);
    m.rotation.z = state.clock.elapsedTime * 0.004;
  });

  return (
    <mesh ref={mesh} position={[-30, 4, -90]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={map} transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

/* ---------------------------------- Scene ----------------------------------- */

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const dir = new THREE.Vector3();
const target = new THREE.Vector3();

// Scroll-driven flight: the rocket approaches from deep space, passes the camera
// at warp, then the view settles into a slow cruise seen through the window.
export function HeroFlightScene({ progress, mobile }: FlightProps) {
  const ship = useRef<THREE.Group>(null);
  const starSpeed = useRef(5);

  useFrame((state) => {
    const p = progress.current ?? 0;
    const t = state.clock.elapsedTime;

    const approach = smooth(clamp01(p / 0.5));
    const pass = clamp01((p - 0.5) / 0.14);
    const passEased = pass * pass;

    if (ship.current) {
      const x = lerp(12, 1.8, approach) + 3.4 * passEased;
      const y = lerp(-7, -1.0, approach) + 1.6 * passEased;
      const z = lerp(-85, 1.5, approach) + 18 * passEased;
      ship.current.position.set(x + Math.sin(t * 0.7) * 0.15, y + Math.sin(t * 1.1) * 0.2, z);
      dir.set(0.22, 0.09 + Math.sin(t * 0.5) * 0.03, 1).normalize();
      target.copy(ship.current.position).add(dir);
      ship.current.lookAt(target);
      ship.current.rotateZ(-0.35 + Math.sin(t * 0.6) * 0.08);
      ship.current.visible = p < 0.7;
    }

    const warp = p < 0.35 ? 0 : p < 0.6 ? smooth((p - 0.35) / 0.25) : 1 - smooth(clamp01((p - 0.6) / 0.18));
    starSpeed.current = lerp(5, 70, warp) * (p > 0.78 ? 0.5 : 1);

    const cam = state.camera as THREE.PerspectiveCamera;
    const fov = 50 + 14 * warp;
    if (Math.abs(cam.fov - fov) > 0.01) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }
    const px = mobile ? 0 : state.pointer.x;
    const py = mobile ? 0 : state.pointer.y;
    cam.position.x = lerp(cam.position.x, px * 0.6, 0.04);
    cam.position.y = lerp(cam.position.y, py * 0.35, 0.04);
    cam.lookAt(cam.position.x * 0.4, cam.position.y * 0.4, -100);
  });

  return (
    <>
      <color attach="background" args={["#0A1633"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[8, 6, 6]} intensity={2.6} color="#fff1dc" />
      <directionalLight position={[-8, -3, -6]} intensity={1.0} color="#8fb0ff" />

      <Nebula />
      <Starfield count={mobile ? 1400 : 3200} speed={starSpeed} />
      <Starfield count={mobile ? 300 : 700} speed={starSpeed} size={0.3} opacity={0.5} depth={120} spread={70} />

      <React.Suspense fallback={null}>
        <Earth progress={progress} mobile={mobile} />
      </React.Suspense>

      <group ref={ship}>
        <Rocket rotation={[Math.PI / 2, 0, 0]} flame={1.4} />
      </group>
    </>
  );
}
