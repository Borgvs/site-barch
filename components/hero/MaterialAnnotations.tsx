"use client";

/**
 * MaterialAnnotations — Etiquetas perpendiculares com glass card.
 *
 * Mantém anatomia da diretriz (dot · stem · tick · text), mas o bloco
 * de texto agora vive dentro de glass-card-dark — material real, profundidade.
 */

import { AnimatePresence, motion } from "framer-motion";
import { MATERIALS, type MaterialAnnotation } from "@/lib/construction-config";

const HIDE_AT_DEFAULT = 0.88;
const EASE = [0.16, 1, 0.3, 1] as const;

export function MaterialAnnotations({ progress }: { progress: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <AnimatePresence>
        {MATERIALS.map((mat, i) => {
          const hideAt = mat.hideAt ?? HIDE_AT_DEFAULT;
          const visible = progress >= mat.showAt && progress < hideAt;
          if (!visible) return null;
          return <Annotation key={mat.id} mat={mat} index={i} />;
        })}
      </AnimatePresence>
    </div>
  );
}

function Annotation({
  mat,
  index,
}: {
  mat: MaterialAnnotation;
  index: number;
}) {
  const stemDown = mat.stem !== "up";

  return (
    <motion.div
      initial={{ opacity: 0, y: stemDown ? -8 : 8, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: stemDown ? -8 : 8, filter: "blur(4px)" }}
      transition={{ duration: 0.65, ease: EASE, delay: index * 0.08 }}
      className="absolute"
      style={{ left: mat.position.x, top: mat.position.y }}
    >
      {stemDown ? <DownStem mat={mat} /> : <UpStem mat={mat} />}
    </motion.div>
  );
}

function DownStem({ mat }: { mat: MaterialAnnotation }) {
  return (
    <div className="flex flex-col items-start">
      <div className="h-1.5 w-1.5 rounded-full bg-paper shadow-[0_0_8px_rgba(252,251,247,0.6)]" />
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.55, ease: EASE, delay: 0.18 }}
        className="ml-[2px] h-9 w-px origin-top bg-paper/55"
      />
      <div className="flex items-start gap-2 -mt-px">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.34 }}
          className="h-px w-5 origin-left bg-paper/55 mt-[8px]"
        />
        <motion.div
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.46 }}
          className="glass-card-dark px-3.5 py-2.5"
          style={{ borderRadius: 12 }}
        >
          <p className="text-[12px] font-medium text-paper leading-tight whitespace-nowrap tracking-tight">
            {mat.name}
          </p>
          <p className="text-[10px] text-paper/55 leading-tight whitespace-nowrap tracking-wide mt-0.5">
            {mat.detail}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function UpStem({ mat }: { mat: MaterialAnnotation }) {
  return (
    <div className="flex flex-col items-start">
      <div className="flex items-start gap-2">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.34 }}
          className="h-px w-5 origin-left bg-paper/55 mt-[8px]"
        />
        <motion.div
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.46 }}
          className="glass-card-dark px-3.5 py-2.5"
          style={{ borderRadius: 12 }}
        >
          <p className="text-[12px] font-medium text-paper leading-tight whitespace-nowrap tracking-tight">
            {mat.name}
          </p>
          <p className="text-[10px] text-paper/55 leading-tight whitespace-nowrap tracking-wide mt-0.5">
            {mat.detail}
          </p>
        </motion.div>
      </div>
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.55, ease: EASE, delay: 0.18 }}
        className="ml-[2px] h-9 w-px origin-bottom bg-paper/55 mt-1"
      />
      <div className="h-1.5 w-1.5 rounded-full bg-paper shadow-[0_0_8px_rgba(252,251,247,0.6)] -mt-px" />
    </div>
  );
}
