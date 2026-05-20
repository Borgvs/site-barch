"use client";

/**
 * ConstructionScene — Three.js procedural da residência sendo construída.
 *
 * Vocabulário: Bernardes + Kogan + Zumthor.
 * Dois blocos em L, pé-direito duplo, balanço de 4m sobre espelho d'água.
 * Tudo dirigido pela ref `progressRef` (0..1) que vem do orchestrator GSAP.
 *
 * Padrão R3F idiomático: cada elemento usa `useFrame` + mutação de refs,
 * sem re-renderizar React. Performance budget < 4ms/frame em desktop médio.
 *
 * Estética: deliberadamente CAD/maquete — coerente com "técnica reduz ruído".
 */

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo, type MutableRefObject } from "react";
import * as THREE from "three";
import { PALETTE } from "@/lib/construction-config";

/* -----------------------------------------------------------------------
 * Easings & utils
 * ---------------------------------------------------------------------- */

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function ramp(
  p: number,
  start: number,
  end: number,
  ease: (t: number) => number = easeOutExpo,
) {
  if (end <= start) return p >= start ? 1 : 0;
  const t = Math.max(0, Math.min(1, (p - start) / (end - start)));
  return ease(t);
}

type ProgressRef = MutableRefObject<number>;

/* -----------------------------------------------------------------------
 * Materiais reutilizáveis
 * ---------------------------------------------------------------------- */

function useMaterials() {
  return useMemo(
    () => ({
      concrete: new THREE.MeshStandardMaterial({
        color: PALETTE.concrete,
        roughness: 0.92,
        metalness: 0.02,
      }),
      concreteDark: new THREE.MeshStandardMaterial({
        color: PALETTE.concreteDark,
        roughness: 0.88,
        metalness: 0.02,
      }),
      wood: new THREE.MeshStandardMaterial({
        color: PALETTE.wood,
        roughness: 0.7,
        metalness: 0.02,
      }),
      woodDark: new THREE.MeshStandardMaterial({
        color: PALETTE.woodDark,
        roughness: 0.75,
        metalness: 0.02,
      }),
      glass: new THREE.MeshPhysicalMaterial({
        color: PALETTE.glass,
        roughness: 0.05,
        metalness: 0,
        transmission: 0.85,
        thickness: 0.4,
        opacity: 0.55,
        transparent: true,
        ior: 1.45,
        clearcoat: 0.5,
      }),
      corten: new THREE.MeshStandardMaterial({
        color: PALETTE.corten,
        roughness: 0.85,
        metalness: 0.2,
      }),
      basalt: new THREE.MeshStandardMaterial({
        color: PALETTE.basalt,
        roughness: 0.95,
        metalness: 0,
      }),
      water: new THREE.MeshStandardMaterial({
        color: PALETTE.water,
        roughness: 0.05,
        metalness: 0.9,
        envMapIntensity: 0.6,
      }),
      ground: new THREE.MeshStandardMaterial({
        color: "#2a2924",
        roughness: 1,
        metalness: 0,
      }),
      caixilho: new THREE.MeshStandardMaterial({
        color: PALETTE.ink,
        roughness: 0.4,
        metalness: 0.1,
      }),
    }),
    [],
  );
}

/* -----------------------------------------------------------------------
 * Helper: animator que zera/escala um grupo a partir de um range
 * ---------------------------------------------------------------------- */

function useGroupAnimator(
  progressRef: ProgressRef,
  start: number,
  end: number,
  axis: "x" | "y" | "z" | "scale" = "scale",
  ease: (t: number) => number = easeOutExpo,
) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!ref.current) return;
    const a = ramp(progressRef.current, start, end, ease);
    if (axis === "scale") {
      ref.current.scale.setScalar(Math.max(0.0001, a));
    } else {
      ref.current.scale[axis] = Math.max(0.0001, a);
    }
    ref.current.visible = a > 0.001;
  });
  return ref;
}

/* -----------------------------------------------------------------------
 * Sub-elementos da residência
 * ---------------------------------------------------------------------- */

function Terrain({ mats }: { mats: ReturnType<typeof useMaterials> }) {
  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.02, 0]}
        receiveShadow
      >
        <planeGeometry args={[80, 80, 1, 1]} />
        <primitive object={mats.ground} attach="material" />
      </mesh>
      {/* Linha do horizonte sutil */}
      <mesh position={[0, 0.005, -22]}>
        <boxGeometry args={[60, 0.02, 0.04]} />
        <meshBasicMaterial color={PALETTE.ink} opacity={0.18} transparent />
      </mesh>
    </group>
  );
}

function Foundations({
  mats,
  progressRef,
}: {
  mats: ReturnType<typeof useMaterials>;
  progressRef: ProgressRef;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!ref.current) return;
    const a = ramp(progressRef.current, 0.08, 0.2);
    ref.current.scale.y = Math.max(0.0001, a);
    ref.current.visible = a > 0.001;
  });
  return (
    <group ref={ref} position={[0, 0, 0]}>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[24, 0.4, 14]} />
        <primitive object={mats.concreteDark} attach="material" />
      </mesh>
      <mesh position={[-9, 0.2, 11]} castShadow receiveShadow>
        <boxGeometry args={[14, 0.4, 8]} />
        <primitive object={mats.concreteDark} attach="material" />
      </mesh>
    </group>
  );
}

function Columns({
  mats,
  progressRef,
}: {
  mats: ReturnType<typeof useMaterials>;
  progressRef: ProgressRef;
}) {
  const ref = useGroupAnimator(progressRef, 0.15, 0.3, "y");
  const positions: [number, number, number][] = useMemo(
    () => [
      [-10, 0, -5],
      [-10, 0, 5],
      [10, 0, -5],
      [10, 0, 5],
      [0, 0, -5],
      [0, 0, 5],
      [-9, 0, 9],
      [-9, 0, 13],
      [-3, 0, 9],
      [-3, 0, 13],
      [3, 0, 9],
      [3, 0, 13],
    ],
    [],
  );
  const fullH = 6.2;
  return (
    <group ref={ref}>
      {positions.map((pos, i) => (
        <mesh key={i} position={[pos[0], fullH / 2 + 0.2, pos[2]]} castShadow>
          <boxGeometry args={[0.5, fullH, 0.5]} />
          <primitive object={mats.concrete} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

function Slabs({
  mats,
  progressRef,
}: {
  mats: ReturnType<typeof useMaterials>;
  progressRef: ProgressRef;
}) {
  // Cada laje tem seu próprio range — vamos animar individualmente
  const slab1 = useRef<THREE.Mesh>(null);
  const slab2 = useRef<THREE.Mesh>(null);
  const slabSup = useRef<THREE.Mesh>(null);
  const cob1 = useRef<THREE.Mesh>(null);
  const cob2 = useRef<THREE.Mesh>(null);
  const balanco = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const p = progressRef.current;
    const a1 = ramp(p, 0.22, 0.32);
    const a2 = ramp(p, 0.26, 0.36);
    const aSup = ramp(p, 0.3, 0.4);
    const aCob1 = ramp(p, 0.32, 0.46);
    const aCob2 = ramp(p, 0.34, 0.46);
    const aBal = ramp(p, 0.34, 0.5);
    if (slab1.current) {
      slab1.current.scale.z = Math.max(0.001, a1);
      slab1.current.visible = a1 > 0.001;
    }
    if (slab2.current) {
      slab2.current.scale.x = Math.max(0.001, a2);
      slab2.current.visible = a2 > 0.001;
    }
    if (slabSup.current) {
      slabSup.current.scale.x = Math.max(0.001, aSup);
      slabSup.current.visible = aSup > 0.001;
    }
    if (cob1.current) {
      cob1.current.scale.z = Math.max(0.001, aCob1);
      cob1.current.visible = aCob1 > 0.001;
    }
    if (cob2.current) {
      cob2.current.scale.x = Math.max(0.001, aCob2);
      cob2.current.visible = aCob2 > 0.001;
    }
    if (balanco.current) {
      balanco.current.scale.x = Math.max(0.001, aBal);
      balanco.current.visible = aBal > 0.001;
    }
  });

  return (
    <group>
      <mesh ref={slab1} position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[24, 0.4, 14]} />
        <primitive object={mats.concrete} attach="material" />
      </mesh>
      <mesh ref={slab2} position={[-9, 0.45, 11]} castShadow receiveShadow>
        <boxGeometry args={[14, 0.4, 8]} />
        <primitive object={mats.concrete} attach="material" />
      </mesh>
      <mesh ref={slabSup} position={[6, 3.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[12, 0.35, 14]} />
        <primitive object={mats.concrete} attach="material" />
      </mesh>
      <mesh ref={cob1} position={[0, 6.4, 0]} castShadow>
        <boxGeometry args={[24.4, 0.35, 14.4]} />
        <primitive object={mats.concreteDark} attach="material" />
      </mesh>
      <mesh ref={cob2} position={[-9, 3.65, 11]} castShadow>
        <boxGeometry args={[14.4, 0.35, 8.4]} />
        <primitive object={mats.concreteDark} attach="material" />
      </mesh>
      <mesh ref={balanco} position={[14, 0.45, 0]} castShadow>
        <boxGeometry args={[4, 0.4, 14]} />
        <primitive object={mats.concrete} attach="material" />
      </mesh>
    </group>
  );
}

function Walls({
  mats,
  progressRef,
}: {
  mats: ReturnType<typeof useMaterials>;
  progressRef: ProgressRef;
}) {
  const ref = useGroupAnimator(progressRef, 0.35, 0.55, "y");
  const wallH = 6;
  return (
    <group ref={ref}>
      <mesh position={[0, 0.65 + wallH / 2, -7]} castShadow receiveShadow>
        <boxGeometry args={[24, wallH, 0.3]} />
        <primitive object={mats.concrete} attach="material" />
      </mesh>
      <mesh position={[-12.15, 0.65 + wallH / 2, 0]} castShadow>
        <boxGeometry args={[0.3, wallH, 14]} />
        <primitive object={mats.concrete} attach="material" />
      </mesh>
      <mesh position={[-9, 0.65 + (wallH * 0.5) / 2, 15.15]} castShadow>
        <boxGeometry args={[14, wallH * 0.5, 0.3]} />
        <primitive object={mats.concrete} attach="material" />
      </mesh>
      <mesh position={[-16.15, 0.65 + (wallH * 0.5) / 2, 11]} castShadow>
        <boxGeometry args={[0.3, wallH * 0.5, 8]} />
        <primitive object={mats.concrete} attach="material" />
      </mesh>
      <mesh position={[-9, 0.65 + (wallH * 0.5) / 2, 7.15]} castShadow>
        <boxGeometry args={[6, wallH * 0.5, 0.3]} />
        <primitive object={mats.concrete} attach="material" />
      </mesh>
    </group>
  );
}

function GlassPanels({
  mats,
  progressRef,
}: {
  mats: ReturnType<typeof useMaterials>;
  progressRef: ProgressRef;
}) {
  const ref = useGroupAnimator(progressRef, 0.55, 0.68, "y");
  const h = 6;
  return (
    <group ref={ref}>
      <mesh position={[0, 0.65 + h / 2, 7]}>
        <boxGeometry args={[24, h, 0.08]} />
        <primitive object={mats.glass} attach="material" />
      </mesh>
      <mesh position={[12, 0.65 + h / 2, 0]}>
        <boxGeometry args={[0.08, h, 14]} />
        <primitive object={mats.glass} attach="material" />
      </mesh>
      {[-8, -4, 0, 4, 8].map((x) => (
        <mesh key={x} position={[x, 0.65 + h / 2, 7]}>
          <boxGeometry args={[0.06, h, 0.1]} />
          <primitive object={mats.caixilho} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

function Deck({
  mats,
  progressRef,
}: {
  mats: ReturnType<typeof useMaterials>;
  progressRef: ProgressRef;
}) {
  const ref = useGroupAnimator(progressRef, 0.58, 0.72, "x");
  return (
    <group ref={ref}>
      <mesh position={[0, 0.5, 11]} receiveShadow>
        <boxGeometry args={[24, 0.08, 6]} />
        <primitive object={mats.wood} attach="material" />
      </mesh>
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i} position={[-11 + i * 2, 0.541, 11]}>
          <boxGeometry args={[0.02, 0.001, 6]} />
          <meshBasicMaterial color={PALETTE.ink} opacity={0.35} transparent />
        </mesh>
      ))}
    </group>
  );
}

function Brises({
  mats,
  progressRef,
}: {
  mats: ReturnType<typeof useMaterials>;
  progressRef: ProgressRef;
}) {
  const ref = useGroupAnimator(progressRef, 0.62, 0.76, "y");
  return (
    <group ref={ref}>
      {Array.from({ length: 14 }).map((_, i) => (
        <mesh
          key={i}
          position={[12 + (i / 14) * 4, 6.5, -6 + i * 0.95]}
        >
          <boxGeometry args={[3.8, 0.12, 0.12]} />
          <primitive object={mats.woodDark} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

function Pool({
  mats,
  progressRef,
}: {
  mats: ReturnType<typeof useMaterials>;
  progressRef: ProgressRef;
}) {
  const ref = useGroupAnimator(progressRef, 0.7, 0.85, "x", easeInOutCubic);
  return (
    <group ref={ref}>
      <mesh position={[14, 0.21, 0]} receiveShadow>
        <boxGeometry args={[8, 0.05, 12]} />
        <primitive object={mats.water} attach="material" />
      </mesh>
      <mesh position={[14, 0.18, 6.2]}>
        <boxGeometry args={[8.4, 0.06, 0.4]} />
        <primitive object={mats.basalt} attach="material" />
      </mesh>
      <mesh position={[14, 0.18, -6.2]}>
        <boxGeometry args={[8.4, 0.06, 0.4]} />
        <primitive object={mats.basalt} attach="material" />
      </mesh>
    </group>
  );
}

function CortenAccent({
  mats,
  progressRef,
}: {
  mats: ReturnType<typeof useMaterials>;
  progressRef: ProgressRef;
}) {
  const ref = useGroupAnimator(progressRef, 0.65, 0.78, "y");
  return (
    <group ref={ref}>
      <mesh position={[-12.5, 0.65 + 3, 5.5]}>
        <boxGeometry args={[0.15, 6, 3]} />
        <primitive object={mats.corten} attach="material" />
      </mesh>
    </group>
  );
}

function BasaltFloor({
  mats,
  progressRef,
}: {
  mats: ReturnType<typeof useMaterials>;
  progressRef: ProgressRef;
}) {
  const ref = useGroupAnimator(progressRef, 0.74, 0.86, "x");
  return (
    <group ref={ref}>
      <mesh position={[0, 0.06, 18]} receiveShadow>
        <boxGeometry args={[28, 0.04, 4]} />
        <primitive object={mats.basalt} attach="material" />
      </mesh>
    </group>
  );
}

function Landscaping({ progressRef }: { progressRef: ProgressRef }) {
  const ref = useGroupAnimator(progressRef, 0.78, 0.92, "scale", easeInOutCubic);
  const trees = useMemo(
    () =>
      [
        { x: -18, z: -10, h: 4 },
        { x: -18, z: 18, h: 5 },
        { x: 20, z: -12, h: 3.5 },
        { x: 22, z: 14, h: 4.5 },
        { x: -22, z: 0, h: 3 },
        { x: 24, z: 0, h: 3.8 },
      ] as const,
    [],
  );
  return (
    <group ref={ref}>
      {trees.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]}>
          <mesh position={[0, t.h / 2, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, t.h, 6]} />
            <meshStandardMaterial color={PALETTE.woodDark} roughness={1} />
          </mesh>
          <mesh position={[0, t.h + 0.3, 0]} castShadow>
            <sphereGeometry args={[0.9, 8, 6]} />
            <meshStandardMaterial
              color={PALETTE.muted}
              roughness={1}
              flatShading
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* -----------------------------------------------------------------------
 * Luz e câmera animadas
 * ---------------------------------------------------------------------- */

function AnimatedSun({ progressRef }: { progressRef: ProgressRef }) {
  const sunRef = useRef<THREE.DirectionalLight>(null);

  useFrame(() => {
    if (!sunRef.current) return;
    const p = progressRef.current;
    const lightProgress = ramp(p, 0.6, 1.0, easeInOutCubic);
    const angle = (1 - lightProgress) * Math.PI * 0.35 + 0.15;
    const x = Math.sin(angle) * 30;
    const y = Math.cos(angle) * 25 + 12;
    sunRef.current.position.set(x, y, 18);
    sunRef.current.intensity = 0.6 + lightProgress * 1.4;
  });

  return (
    <>
      <ambientLight intensity={0.35} color="#F0EDE5" />
      <hemisphereLight args={["#FCFBF7", "#3A3A38", 0.45]} />
      <directionalLight
        ref={sunRef}
        position={[20, 28, 18]}
        intensity={1.4}
        color="#FFF5E0"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={80}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
    </>
  );
}

function CameraRig({ progressRef }: { progressRef: ProgressRef }) {
  const target = useRef(new THREE.Vector3(0, 3, 4));
  useFrame(({ camera, mouse }) => {
    const p = progressRef.current;
    const orbitProgress = easeInOutCubic(Math.max(0, Math.min(1, p)));
    const baseAngle = -Math.PI * 0.18;
    const angle = baseAngle + orbitProgress * 0.1;
    const radius = 42 - orbitProgress * 8;
    const targetX = Math.sin(angle) * radius;
    const targetZ = Math.cos(angle) * radius + 4;
    const targetY = 18 - orbitProgress * 4;

    // Mouse parallax sutil
    const px = mouse.x * 0.6;
    const py = mouse.y * 0.4;

    camera.position.lerp(
      new THREE.Vector3(targetX + px, targetY + py, targetZ),
      0.06,
    );
    camera.lookAt(target.current);
  });
  return null;
}

/* -----------------------------------------------------------------------
 * Scene contents
 * ---------------------------------------------------------------------- */

function SceneContents({ progressRef }: { progressRef: ProgressRef }) {
  const mats = useMaterials();
  return (
    <>
      <AnimatedSun progressRef={progressRef} />
      <CameraRig progressRef={progressRef} />
      <Terrain mats={mats} />
      <Foundations mats={mats} progressRef={progressRef} />
      <Columns mats={mats} progressRef={progressRef} />
      <Slabs mats={mats} progressRef={progressRef} />
      <Walls mats={mats} progressRef={progressRef} />
      <GlassPanels mats={mats} progressRef={progressRef} />
      <Deck mats={mats} progressRef={progressRef} />
      <Brises mats={mats} progressRef={progressRef} />
      <CortenAccent mats={mats} progressRef={progressRef} />
      <BasaltFloor mats={mats} progressRef={progressRef} />
      <Pool mats={mats} progressRef={progressRef} />
      <Landscaping progressRef={progressRef} />
    </>
  );
}

/* -----------------------------------------------------------------------
 * Canvas público
 * ---------------------------------------------------------------------- */

interface ConstructionSceneProps {
  progressRef: ProgressRef;
  quality?: "high" | "low";
}

export function ConstructionScene({
  progressRef,
  quality = "high",
}: ConstructionSceneProps) {
  const dpr: [number, number] = quality === "high" ? [1, 2] : [1, 1.25];

  return (
    <Canvas
      shadows
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
      }}
      camera={{ position: [22, 18, 32], fov: 38, near: 0.1, far: 200 }}
      dpr={dpr}
      style={{ background: "#0a0a0a" }}
    >
      <fog attach="fog" args={["#0a0a0a", 50, 130]} />
      <SceneContents progressRef={progressRef} />
    </Canvas>
  );
}
