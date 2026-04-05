import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const POINT_COUNT = 2400;
const GLOBE_RADIUS = 1.2;

export default function PointCloudGlobe() {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
		camera.position.set(0, 0, 4.2);

		const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setSize(container.clientWidth, container.clientHeight);
		renderer.outputColorSpace = THREE.SRGBColorSpace;
		container.appendChild(renderer.domElement);

		const globeGroup = new THREE.Group();
		scene.add(globeGroup);

		const positions = new Float32Array(POINT_COUNT * 3);
		const basePositions = new Float32Array(POINT_COUNT * 3);
		const phases = new Float32Array(POINT_COUNT);

		for (let i = 0; i < POINT_COUNT; i++) {
			const u = Math.random();
			const v = Math.random();
			const theta = 2 * Math.PI * u;
			const phi = Math.acos(2 * v - 1);
			const x = GLOBE_RADIUS * Math.sin(phi) * Math.cos(theta);
			const y = GLOBE_RADIUS * Math.sin(phi) * Math.sin(theta);
			const z = GLOBE_RADIUS * Math.cos(phi);
			const idx = i * 3;
			basePositions[idx] = x;
			basePositions[idx + 1] = y;
			basePositions[idx + 2] = z;
			positions[idx] = x;
			positions[idx + 1] = y;
			positions[idx + 2] = z;
			phases[i] = Math.random() * Math.PI * 2;
		}

		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

		const material = new THREE.PointsMaterial({
			color: 0x00f3ff,
			size: 0.028,
			sizeAttenuation: true,
			transparent: true,
			opacity: 0.92,
		});

		const points = new THREE.Points(geometry, material);
		globeGroup.add(points);

		// Invisible sphere to get stable hover intersections.
		const hitSphere = new THREE.Mesh(
			new THREE.SphereGeometry(GLOBE_RADIUS, 32, 32),
			new THREE.MeshBasicMaterial({ visible: false }),
		);
		globeGroup.add(hitSphere);

		scene.add(new THREE.AmbientLight(0xffffff, 0.8));
		const directional = new THREE.DirectionalLight(0x00f3ff, 1.25);
		directional.position.set(2, 3, 4);
		scene.add(directional);

		const raycaster = new THREE.Raycaster();
		const pointer = new THREE.Vector2(2, 2);
		const hoverNormal = new THREE.Vector3();
		const baseDirection = new THREE.Vector3();
		let hasHover = false;

		const updatePointer = (event: PointerEvent) => {
			const rect = renderer.domElement.getBoundingClientRect();
			pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
			pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
			raycaster.setFromCamera(pointer, camera);
			const intersections = raycaster.intersectObject(hitSphere);
			if (intersections.length > 0) {
				hoverNormal.copy(intersections[0].point).normalize();
				hasHover = true;
				return;
			}
			hasHover = false;
		};

		const clearPointer = () => {
			hasHover = false;
			pointer.set(2, 2);
		};

		renderer.domElement.addEventListener('pointermove', updatePointer);
		renderer.domElement.addEventListener('pointerleave', clearPointer);

		const clock = new THREE.Clock();
		let animationFrame = 0;
		const positionAttribute = geometry.getAttribute('position') as THREE.BufferAttribute;

		const animate = () => {
			const elapsed = clock.getElapsedTime();

			for (let i = 0; i < POINT_COUNT; i++) {
				const idx = i * 3;
				const x = basePositions[idx];
				const y = basePositions[idx + 1];
				const z = basePositions[idx + 2];

				baseDirection.set(x, y, z).normalize();
				const idlePulse = Math.sin(elapsed * 0.8 + phases[i]) * 0.012;
				let hoverWave = 0;

				if (hasHover) {
					const distance = baseDirection.distanceTo(hoverNormal);
					const influence = Math.exp(-(distance * distance) * 14);
					hoverWave = Math.sin(elapsed * 3 + phases[i]) * 0.08 * influence;
				}

				const scale = 1 + idlePulse + hoverWave;
				positionAttribute.array[idx] = x * scale;
				positionAttribute.array[idx + 1] = y * scale;
				positionAttribute.array[idx + 2] = z * scale;
			}

			positionAttribute.needsUpdate = true;
			globeGroup.rotation.y += 0.0018;
			globeGroup.rotation.x = Math.sin(elapsed * 0.35) * 0.12;

			renderer.render(scene, camera);
			animationFrame = window.requestAnimationFrame(animate);
		};

		animate();

		const resizeObserver = new ResizeObserver(() => {
			const width = container.clientWidth;
			const height = container.clientHeight;
			if (!width || !height) return;
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			renderer.setSize(width, height);
		});
		resizeObserver.observe(container);

		return () => {
			window.cancelAnimationFrame(animationFrame);
			resizeObserver.disconnect();
			renderer.domElement.removeEventListener('pointermove', updatePointer);
			renderer.domElement.removeEventListener('pointerleave', clearPointer);
			hitSphere.geometry.dispose();
			(hitSphere.material as THREE.Material).dispose();
			geometry.dispose();
			material.dispose();
			renderer.dispose();
			renderer.domElement.remove();
		};
	}, []);

	return <div ref={containerRef} className="h-[340px] w-full md:h-[430px]" />;
}
