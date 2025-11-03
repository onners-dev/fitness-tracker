import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import "./Dock.css";

function DockLabel({ children, hovered }) {
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
    <div
      ref={ref}
      className={`dock-item ${className}`}
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
      {/* Label positioned relative to dock-item, not dock-inner */}
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