import { useEffect, useRef } from "react";
import { KuralCard } from "@/components/kural-card";

const THRESHOLD = 72;
const OUT_MS = 220;
const IN_MS = 250;

type Props = {
  number: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export function SwipeStage({ number, canPrev, canNext, onPrev, onNext }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const start = useRef({ x: 0, y: 0, t: 0, axis: null as null | "x" | "y" });
  const dx = useRef(0);
  const dragging = useRef(false);
  const locked = useRef(false);
  const numberRef = useRef(number);
  numberRef.current = number;

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transition = `opacity ${IN_MS}ms cubic-bezier(0.22, 1, 0.36, 1), transform ${IN_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`;
    card.style.transform = "translate3d(0, 12px, 0)";
    card.style.opacity = "0";
    const id = requestAnimationFrame(() => {
      card.style.transform = "translate3d(0, 0, 0)";
      card.style.opacity = "1";
    });
    return () => cancelAnimationFrame(id);
  }, [number]);

  function setShift(x: number, animate: boolean) {
    const card = cardRef.current;
    if (!card) return;
    const rot = x * 0.035;
    card.style.transition = animate
      ? `transform ${OUT_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${OUT_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`
      : "none";
    card.style.transform = `translate3d(${x}px, 0, 0) rotate(${rot}deg)`;
    card.style.opacity = String(Math.max(0.35, 1 - Math.abs(x) / 480));
  }

  function commit(dir: -1 | 1) {
    if (locked.current) return;
    const allowed = dir < 0 ? canNext : canPrev;
    if (!allowed) {
      setShift(0, true);
      return;
    }
    locked.current = true;
    const width = stageRef.current?.clientWidth ?? 360;
    setShift(dir * (width + 48), true);
    window.setTimeout(() => {
      if (dir < 0) onNext();
      else onPrev();
      dx.current = 0;
      locked.current = false;
    }, OUT_MS);
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (locked.current) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragging.current = true;
    start.current = { x: event.clientX, y: event.clientY, t: Date.now(), axis: null };
    dx.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current || locked.current) return;
    const mx = event.clientX - start.current.x;
    const my = event.clientY - start.current.y;
    if (!start.current.axis) {
      if (Math.abs(mx) < 8 && Math.abs(my) < 8) return;
      start.current.axis = Math.abs(mx) > Math.abs(my) ? "x" : "y";
    }
    if (start.current.axis !== "x") return;
    event.preventDefault();
    let next = mx;
    if ((next > 0 && !canPrev) || (next < 0 && !canNext)) next *= 0.28;
    dx.current = next;
    setShift(next, false);
  }

  function onPointerUp() {
    if (!dragging.current) return;
    dragging.current = false;
    if (locked.current) return;
    if (start.current.axis !== "x") {
      setShift(0, true);
      return;
    }
    const elapsed = Math.max(1, Date.now() - start.current.t);
    const velocity = dx.current / elapsed;
    if (dx.current <= -THRESHOLD || velocity < -0.45) commit(-1);
    else if (dx.current >= THRESHOLD || velocity > 0.45) commit(1);
    else setShift(0, true);
    start.current.axis = null;
  }

  return (
    <div
      ref={stageRef}
      className="relative h-full min-h-0 touch-pan-y select-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div ref={cardRef} className="h-full will-change-transform">
        <KuralCard number={number} />
      </div>
    </div>
  );
}
