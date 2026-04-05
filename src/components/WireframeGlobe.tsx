import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export default function WireframeGlobe() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2('#0a0a0a', 1, 30);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.z = 4;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Glowing Wireframe Material (Charcoal tech)
    const material = new THREE.MeshBasicMaterial({
      color: 0x444444,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });

    const geometry = new THREE.IcosahedronGeometry(2, 6);
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    // Inner subtle glow sphere
    const innerGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0x060b12,
      transparent: true,
      opacity: 0.8,
    });
    const innerGlobe = new THREE.Mesh(new THREE.IcosahedronGeometry(1.98, 8), innerGlowMaterial);
    scene.add(innerGlobe);

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    const onDocumentMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX - windowHalfX) * 0.0005;
      mouseY = (event.clientY - windowHalfY) * 0.0005;
    };
    document.addEventListener('mousemove', onDocumentMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);
      targetX = mouseX * 0.5;
      targetY = mouseY * 0.5;
      
      globe.rotation.y += 0.001; // slow rotate
      globe.rotation.x += 0.0005;
      
      globe.rotation.y += 0.05 * (targetX - globe.rotation.y);
      globe.rotation.x += 0.05 * (targetY - globe.rotation.x);

      renderer.render(scene, camera);
    };

    animate();

    const onWindowResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', onWindowResize);

    return () => {
      window.removeEventListener('resize', onWindowResize);
      document.removeEventListener('mousemove', onDocumentMouseMove);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full cursor-crosshair"></div>;
}