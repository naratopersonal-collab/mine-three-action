import { useCallback, useState, RefObject } from "react";
import * as THREE from "three";
import { toast } from "sonner";

interface BlockType {
  name: string;
  color: string;
}

const BLOCK_TYPES: BlockType[] = [
  { name: "Grass", color: "#7cb342" },
  { name: "Dirt", color: "#8b5a2b" },
  { name: "Stone", color: "#888888" },
  { name: "Wood", color: "#a0522d" },
  { name: "Sand", color: "#f4a460" },
];

export const useMinecraftWorld = (canvasRef: RefObject<HTMLCanvasElement>) => {
  const [selectedBlock, setSelectedBlock] = useState<string>("Grass");

  const initializeGame = useCallback(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);

    const camera = new THREE.PerspectiveCamera(
      75,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: false,
    });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Store blocks
    const blocks: THREE.Group[] = [];

    // Create initial ground
    for (let x = -5; x <= 5; x++) {
      for (let z = -5; z <= 5; z++) {
        addBlock(x, 0, z, "#7cb342");
      }
    }

    function addBlock(x: number, y: number, z: number, color: string) {
      const blockGroup = new THREE.Group();
      
      // Main block
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshLambertMaterial({ color });
      const cube = new THREE.Mesh(geometry, material);
      blockGroup.add(cube);

      // Add edges for block boundaries
      const edges = new THREE.EdgesGeometry(geometry);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
      const wireframe = new THREE.LineSegments(edges, lineMaterial);
      blockGroup.add(wireframe);

      blockGroup.position.set(x, y, z);
      scene.add(blockGroup);
      blocks.push(blockGroup);
      return blockGroup;
    }

    function removeBlock(position: THREE.Vector3) {
      const blockIndex = blocks.findIndex((block) => {
        const blockPos = block.position;
        return (
          Math.abs(blockPos.x - position.x) < 0.5 &&
          Math.abs(blockPos.y - position.y) < 0.5 &&
          Math.abs(blockPos.z - position.z) < 0.5
        );
      });

      if (blockIndex !== -1) {
        scene.remove(blocks[blockIndex]);
        blocks.splice(blockIndex, 1);
        toast.success("Block removed!");
      }
    }

    // Raycaster for block selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onCanvasClick(event: MouseEvent) {
      const rect = canvasRef.current!.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const allMeshes: THREE.Mesh[] = [];
      blocks.forEach((group) => {
        group.children.forEach((child) => {
          if (child instanceof THREE.Mesh) {
            allMeshes.push(child);
          }
        });
      });

      const intersects = raycaster.intersectObjects(allMeshes);

      if (intersects.length > 0) {
        const intersect = intersects[0];
        const point = intersect.point;
        const normal = intersect.face!.normal;

        if (event.button === 0) {
          // Left click - place block
          const newPos = new THREE.Vector3(
            Math.floor(point.x + normal.x * 0.5),
            Math.floor(point.y + normal.y * 0.5),
            Math.floor(point.z + normal.z * 0.5)
          );

          const blockColor =
            BLOCK_TYPES.find((b) => b.name === selectedBlock)?.color || "#7cb342";
          addBlock(newPos.x, newPos.y, newPos.z, blockColor);
          toast.success(`${selectedBlock} block placed!`);
        } else if (event.button === 2) {
          // Right click - remove block
          removeBlock(intersect.object.parent!.position);
        }
      }
    }

    canvasRef.current.addEventListener("click", onCanvasClick);
    canvasRef.current.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      onCanvasClick(e as any);
    });

    // Camera controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    function onMouseDown(e: MouseEvent) {
      if (e.button === 1) {
        // Middle mouse button
        isDragging = true;
      }
    }

    function onMouseMove(e: MouseEvent) {
      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        camera.position.x -= deltaX * 0.01;
        camera.position.y += deltaY * 0.01;
        camera.lookAt(0, 0, 0);
      }

      previousMousePosition = { x: e.clientX, y: e.clientY };
    }

    function onMouseUp() {
      isDragging = false;
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const zoomSpeed = 0.1;
      const direction = camera.position.clone().normalize();
      camera.position.addScaledVector(direction, e.deltaY * zoomSpeed * -0.01);
    }

    canvasRef.current.addEventListener("mousedown", onMouseDown);
    canvasRef.current.addEventListener("mousemove", onMouseMove);
    canvasRef.current.addEventListener("mouseup", onMouseUp);
    canvasRef.current.addEventListener("wheel", onWheel);

    // Handle window resize
    const handleResize = () => {
      if (!canvasRef.current) return;
      camera.aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();

    toast.success("World loaded! Start building!");

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, [canvasRef, selectedBlock]);

  return {
    selectedBlock,
    setSelectedBlock,
    blockTypes: BLOCK_TYPES,
    initializeGame,
  };
};
