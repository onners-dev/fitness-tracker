import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import "./Dock.css";

function DockLabel({ children, hovered }) {
  return (
    <AnimatePresence>
      {hovered && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: 0 }}
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

function DockIcon({ children }) {
  return <div className="dock-icon">{children}</div>;
}

function DockItem({
  icon,
  label,
  className = "",
  onClick,
  animationScale = 1.2,
  baseItemSize = 50,
}) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);

  return (
    <motion.div
      ref={ref}
      style={{
        width: baseItemSize,
        height: baseItemSize,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      onClick={onClick}
      className={`dock-item ${className}`}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
      animate={{
        scale: hovered ? animationScale : 1,
        zIndex: hovered ? 2 : 1,
        transition: { type: "spring", stiffness: 250, damping: 15 },
      }}
    >
      <DockIcon>{icon}</DockIcon>
      <DockLabel hovered={hovered}>{label}</DockLabel>
    </motion.div>
  );
}

export default function Dock({
  items,
  className = "",
  animationScale = 1.2,
  baseItemSize = 50,
  panelHeight = 68,
}) {
  return (
    <div className={`dock-panel ${className}`} style={{ height: panelHeight }}>
      {items.map((item, index) => (
        <DockItem
          key={index}
          icon={item.icon}
          label={item.label}
          onClick={item.onClick}
          className={item.className}
          animationScale={animationScale}
          baseItemSize={baseItemSize}
        />
      ))}
    </div>
  );
}
