import React from "react";
import Dock from "./Dock.js";
import { VscHome, VscFlame, VscGraph, VscAccount, VscSettingsGear, VscSignOut } from "react-icons/vsc";
import { useNavigate } from "react-router-dom";

const SiteDock = () => {
  const navigate = useNavigate();

  const items = [
    { icon: <VscHome size={24} />, label: "Home", onClick: () => navigate("/home") },
    { icon: <VscFlame size={24} />, label: "Calorie Tracker", onClick: () => navigate("/calorietracker") },
    { icon: <VscGraph size={24} />, label: "Trends", onClick: () => navigate("/trends") },
    { icon: <VscAccount size={24} />, label: "Profile", onClick: () => navigate("/dashboard") },
    { icon: <VscSettingsGear size={24} />, label: "Settings", onClick: () => navigate("/settings") },
    { icon: <VscSignOut size={24} />, label: "Logout", onClick: () => { localStorage.removeItem("token"); navigate("/login"); } },
  ];

  return (
    <Dock items={items} />
  );
};

export default SiteDock;
