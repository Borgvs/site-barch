"use client";

/**
 * BimModel3D — Three.js scene mostrando modelo federado BIM interativo.
 *
 * Casa procedural mostrando lajes (arquitetura), pilares (estrutural),
 * vigas horizontais (hidráulica) e diagonais (elétrica). Auto-rotate +
 * boost no hover. Contida no card · não-imersiva.
 */

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState, type MutableRefObject } from "react";

function HouseStructure({
  rotRef,
  hovered,
}: {
  rotRef: MutableRefObject<number>;
  hovered: boolean;
}) {
  const groupRef = useRef<import("three").Group>(null);
  const targetRot = useRef(rotRef.current);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const speed = hovered ? 0.45 : 0.16;
    targetRot.current += delta * speed;
    rotRef.current += (targetRot.current - rotRef.current) * 0.08;
    groupRef.current.rotation.y = rotRef.current;
  });

  const positions: [number, number][] = [
    [-1.8, -1.1],
    [-0.6, -1.1],
    [0.6, -1.1],
    [1.8, -1.1],
    [-1.8, 1.1],
    [-0.6, 1.1],
    [0.6, 1.1],
    [1.8, 1.1],
  ];

  return (
    <group ref={groupRef} position={[0, -0.4, 0]}>
      {/* === ARQUITETURA · Lajes (sólidas) === */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[4, 0.12, 2.5]} />
        <meshStandardMaterial color="#d4d2cc" roughness={0.92} />
      </mesh>
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[4, 0.12, 2.5]} />
        <meshStandardMaterial color="#d4d2cc" roughness={0.92} />
      </mesh>
      <mesh position={[0, 2.4, 0]} castShadow>
        <boxGeometry args={[4.2, 0.14, 2.6]} />
        <meshStandardMaterial color="#c2c0ba" roughness={0.92} />
      </mesh>
      {/* Bloco L */}
      <mesh position={[-1.8, 0, 1.8]} castShadow>
        <boxGeometry args={[2.5, 0.12, 1.5]} />
        <meshStandardMaterial color="#d4d2cc" roughness={0.92} />
      </mesh>
      <mesh position={[-1.8, 1.2, 1.8]} castShadow>
        <boxGeometry args={[2.5, 0.12, 1.5]} />
        <meshStandardMaterial color="#d4d2cc" roughness={0.92} />
      </mesh>

      {/* === ESTRUTURAL · Pilares (paper sólido black) === */}
      {positions.map((p, i) => (
        <mesh key={`pil-${i}`} position={[p[0], 1.2, p[1]]} castShadow>
          <boxGeometry args={[0.08, 2.5, 0.08]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.6} />
        </mesh>
      ))}

      {/* === HIDRÁULICA · Linhas horizontais paper/55 === */}
      {[0.3, 0.9, 1.5].map((y, i) => (
        <mesh key={`h-${i}`} position={[0, y, -1.0]}>
          <boxGeometry args={[3.8, 0.03, 0.03]} />
          <meshBasicMaterial color="#a8a8a0" transparent opacity={0.75} />
        </mesh>
      ))}
      {[0.3, 0.9, 1.5].map((y, i) => (
        <mesh key={`h2-${i}`} position={[0, y, 1.0]}>
          <boxGeometry args={[3.8, 0.03, 0.03]} />
          <meshBasicMaterial color="#a8a8a0" transparent opacity={0.75} />
        </mesh>
      ))}

      {/* === ELÉTRICA · diagonais sutis === */}
      {[1.7, 1.85, 2.0].map((y, i) => (
        <mesh key={`e-${i}`} position={[0, y, 0]}>
          <boxGeometry args={[3.5, 0.02, 0.02]} />
          <meshBasicMaterial color="#6B6B66" transparent opacity={0.55} />
        </mesh>
      ))}

      {/* Volume wireframe (4 cantos verticais discretos) */}
      {([
        [-2.0, 1.25],
        [2.0, 1.25],
        [-2.0, -1.25],
        [2.0, -1.25],
      ] as [number, number][]).map((p, i) => (
        <mesh key={`v-${i}`} position={[p[0], 1.2, p[1]]}>
          <boxGeometry args={[0.025, 2.6, 0.025]} />
          <meshBasicMaterial color="#fcfbf7" transparent opacity={0.35} />
        </mesh>
      ))}

      {/* Terreno */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.1, 0]}
        receiveShadow
      >
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#1a1a1a" roughness={1} />
      </mesh>
    </group>
  );
}

function CameraRig({ hovered }: { hovered: boolean }) {
  useFrame(({ camera }) => {
    const targetZ = hovered ? 7.8 : 8.5;
    camera.position.z += (targetZ - camera.position.z) * 0.06;
  });
  return null;
}

interface BimModel3DProps {
  className?: string;
}

export function BimModel3D({ className }: BimModel3DProps) {
  const rotRef = useRef(0);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`relative ${className ?? ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Canvas
        shadows
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        camera={{ position: [4, 3, 8.5], fov: 35, near: 0.1, far: 30 }}
        dpr={[1, 2]}
        style={{ background: "#0a0a0a" }}
      >
        <fog attach="fog" args={["#0a0a0a", 10, 22]} />
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[6, 8, 4]}
          intensity={1.1}
          color="#FFF5E0"
          castShadow
        />
        <hemisphereLight args={["#FCFBF7", "#1a1a1a", 0.45]} />
        <CameraRig hovered={hovered} />
        <HouseStructure rotRef={rotRef} hovered={hovered} />
      </Canvas>

      {/* Legenda BIM · disciplinas */}
      <div className="absolute bottom-5 left-6 z-10 pointer-events-none">
        <p className="text-[10.5px] tracking-[0.32em] uppercase text-paper/65 font-medium mb-2">
          Disciplinas federadas
        </p>
        <div className="flex flex-wrap gap-3 text-[10.5px] text-paper/80">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 bg-paper" /> Arquitetura
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 bg-paper/55" /> Estrutural
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 bg-paper/35" /> Hidráulica
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 bg-paper/25" /> Elétrica
          </span>
        </div>
      </div>

      {/* Hover hint */}
      <div className="absolute top-5 right-6 z-10 pointer-events-none">
        <span
          className="glass-pill-dark"
          style={{
            fontSize: 10,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            opacity: hovered ? 0 : 0.85,
            transition: "opacity 400ms ease",
          }}
        >
          Hover · orbita
        </span>
      </div>
    </div>
  );
}
