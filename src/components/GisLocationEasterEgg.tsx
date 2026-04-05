import React, { useState, useEffect } from 'react';

export default function GisLocationEasterEgg() {
  // Simulate a base coordinate (e.g., somewhere in tech hubs or GIS significant places)
  const baseLat = 34.0522;
  const baseLng = -118.2437;
  
  const [coords, setCoords] = useState({ lat: baseLat, lng: baseLng });

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate slight GPS drift (micro movements)
      setCoords(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.00005,
        lng: prev.lng + (Math.random() - 0.5) * 0.00005
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="font-mono text-[10px] text-neutral-600 tracking-wider flex items-center gap-2 group-hover:text-neutral-400 transition-colors cursor-crosshair">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500/50 animate-pulse"></span>
      SYS.LAT: {coords.lat.toFixed(5)} | SYS.LNG: {coords.lng.toFixed(5)}
    </div>
  );
}