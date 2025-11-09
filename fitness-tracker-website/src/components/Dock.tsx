import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import type { ReactNode, MouseEvent, KeyboardEvent } from "react";
import "./Dock.css";

interface DockLabelProps {
  children: ReactNode;
  hovered: boolean;
}

function DockLabel({ children, hovered }: DockLabelProps) {
  return (
    <AnimatePresence>
      {hovered && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className="dock-label"
          role="tooltip"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface DockIconProps {
  children: ReactNode;
}

function DockIcon({ children }: DockIconProps) {
  return <div className="dock-icon">{children}</div>;
}

interface DockItemProps {
  icon: ReactNode;
  label: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>) => void;
  animationScale?: number;
  baseItemSize?: number;
}

function DockItem({
  icon,
  label,
  className,
  onClick,
  animationScale = 1.2,
  baseItemSize = 50,
}: DockItemProps) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className={`dock-item${className ? ` ${className}` : ""}`}
      style={{
        width: baseItemSize,
        height: baseItemSize,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
    >
      <DockLabel hovered={hovered}>{label}</DockLabel>
      <motion.div
        className="dock-inner"
        animate={{
          scale: hovered ? animationScale : 1,
        }}
        transition={{ type: "spring", stiffness: 250, damping: 15 }}
      >
        <DockIcon>{icon}</DockIcon>
      </motion.div>
    </div>
  );
}

export interface DockItemObject {
  icon: ReactNode;
  label: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>) => void;
}

interface DockProps {
  items: DockItemObject[];
  className?: string;
  animationScale?: number;
  baseItemSize?: number;
  panelHeight?: number;
}

export default function Dock({
  items,
  className = "",
  animationScale = 1.2,
  baseItemSize = 50,
  panelHeight = 68,
}: DockProps) {
  return (
    <div className={`dock-panel ${className}`} style={{ height: panelHeight }}>
      {items.map((item, index) => (
        <DockItem
          key={index}
          icon={item.icon}
          label={item.label}
          {...(item.className !== undefined ? { className: item.className } : {})}
          {...(item.onClick !== undefined ? { onClick: item.onClick } : {})}
          animationScale={animationScale}
          baseItemSize={baseItemSize}
        />
      ))}
    </div>
  );
}
