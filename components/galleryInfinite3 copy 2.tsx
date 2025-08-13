"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import normalizeWheel from "normalize-wheel";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
//import { EffectComposer, Pass } from "@react-three/postprocessing";
//import { ShaderMaterial } from "three";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { extend, Object3DNode } from "@react-three/fiber";
import { useCursor, Image, MeshReflectorMaterial, Environment } from "@react-three/drei";
import { Perf } from 'r3f-perf'

// Extend ShaderPass to make it available as a JSX element
extend({ ShaderPass });

// Add type declaration for the ShaderPass component
declare module "@react-three/fiber" {
  interface ThreeElements {
    shaderPass: Object3DNode<ShaderPass, typeof ShaderPass>;
  }
}

// Configurable grid size
const GRID_TILES_X = 4; // Number of columns
const GRID_TILES_Y = 3; // Number of rows

const GRID_GAP = 0.15;
const TILE_SIZE = 2; // Base size (used for height)
const TILE_WIDTH_RATIO = 1.4; // Width ratio for all tiles (e.g., 16:10 aspect ratio)
const TILE_WIDTH = TILE_SIZE * TILE_WIDTH_RATIO; // Actual width
const TILE_HEIGHT = TILE_SIZE; // Actual height

// Use different spacing for horizontal and vertical to prevent overlap
const TILE_SPACE_X = TILE_WIDTH + GRID_GAP;  // Horizontal spacing based on width
const TILE_SPACE_Y = TILE_HEIGHT + GRID_GAP; // Vertical spacing based on height

const GRID_SIZE_X = TILE_SPACE_X * GRID_TILES_X;
const GRID_SIZE_Y = TILE_SPACE_Y * GRID_TILES_Y;
const TOTAL_GRID_SIZE_X = GRID_SIZE_X * 3;
const TOTAL_GRID_SIZE_Y = GRID_SIZE_Y * 3;
const IMAGE_RES = 512;

// Add configurable tile width ratio
const SELECTED_TILE_WIDTH_RATIO = 2; // 16:10 aspect ratio when selected

// Calculate actual dimensions based on ratios
const SELECTED_TILE_WIDTH = TILE_WIDTH * SELECTED_TILE_WIDTH_RATIO; // Wider when selected

const BASE_ZOOM = 7;
const DRAG_ZOOM = 8;
const SUBGRID_BASE_ZOOM = 7; // Closer zoom for subgrid view
const SUBGRID_DRAG_ZOOM = 8; // Less extreme zoom out for subgrid dragging

// Add elasticOut easing function near the top
function elasticOut(t: number): number {
  if (t === 0 || t === 1) return t;
  const c4 = (2 * Math.PI) / 3;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

// Modify the shader to reduce saturation
const PostprocessingShader = {
  uniforms: {
    tDiffuse: { value: null },
    tNormal: { value: null },
    amount: { value: 0.0015 },
    angle: { value: 0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec3 pos = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform sampler2D tDiffuse;
    uniform vec2 uStrength;
    uniform vec2 uScreenRes;
    uniform float uReducedMotion;
    float smoothcircle(vec2 st, float r){
      float dist = distance(st, vec2(0.5));
      return 1.0 - smoothstep(0., r, dist);
    }
    void main() {
      vec2 uv = vUv;

      // zoom distortion - reduce strength to fix oversaturation
      float prox = smoothcircle(uv, 1.);
      float zoomStrength = (uStrength.x+uStrength.y)*5.0; // Reduced from 10 to 5
      float maxZoomStrength = uReducedMotion > 0.5 ? 0.1 : 0.25; // Reduced from 0.2/0.5 to 0.1/0.25
      zoomStrength = clamp(zoomStrength, 0., maxZoomStrength);
      vec2 zoomedUv = mix(uv, vec2(0.5), prox*zoomStrength);
      vec4 tex = texture2D(tDiffuse, zoomedUv);

      // rgb shift - reduce strength
      if (uReducedMotion < 0.5) {
				float rgbShiftStrength = (uStrength.x+uStrength.y) * 0.3;
        tex.r = texture2D(tDiffuse, zoomedUv + rgbShiftStrength).r;
        tex.b = texture2D(tDiffuse, zoomedUv - rgbShiftStrength).b;
      }

      gl_FragColor = tex;
    }
  `,
};

// Main Grid image tiles - update positions to use separate X and Y spacing
const GRID_TILES = Array.from({ length: GRID_TILES_Y }, (_, row) =>
  Array.from({ length: GRID_TILES_X }, (_, col) => ({
    row,
    col,
    pos: [
      (col - Math.floor(GRID_TILES_X / 2)) * TILE_SPACE_X,
      (Math.floor(GRID_TILES_Y / 2) - row) * TILE_SPACE_Y,
      0
    ],
    image: `https://picsum.photos/${IMAGE_RES}?random=${row * GRID_TILES_X + col + 1}`,
  }))
).flat();

// Update the GRID_TILE_GROUPS to use separate X and Y grid sizes
const GRID_TILE_GROUPS = Array.from({ length: 3 * 3 }, (_, i) => {
  const gx = i % 3;
  const gy = Math.floor(i / 3);
  return {
    pos: [
      GRID_SIZE_X * (gx - 1),
      GRID_SIZE_Y * (1 - gy),
      0
    ],
  };
});

// Update the SUBGRID_TILE_GROUPS to use the horizontal spacing
const SUBGRID_SIZE = 7; // Number of tiles in the subgrid
const TOTAL_SUBGRID_SIZE = SUBGRID_SIZE * TILE_SPACE_X;

const SUBGRID_TILE_GROUPS = [
  {
    pos: [TOTAL_SUBGRID_SIZE * -1, 0, 0],
  },
  {
    pos: [0, 0, 0],
  },
  {
    pos: [TOTAL_SUBGRID_SIZE, 0, 0],
  }
];

// Generate subgrid tile groups with proper spacing
// const SUBGRID_TILE_GROUPS = Array.from({ length: 1 }, () => ({
//   // Only one group needed for subgrid
//   pos: [0, 0, 0],
// }));

// const SUBGRID_TILE_GROUPS = [
//     {
//       pos: [TOTAL_SUBGRID_SIZE * -1, 0, 0],
//     },
//     {
//       pos: [0, 0, 0],
//     },
//     {
//       pos: [TOTAL_SUBGRID_SIZE, 0, 0],
//     }
// ];

const reducedMotionMediaQuery = false; //window.matchMedia('(prefers-reduced-motion: reduce)');

// full screen postprocessing shader
const distortionShader = {
  uniforms: {
    tDiffuse: { value: null },
    uStrength: { value: new THREE.Vector2() },
    uScreenRes: { value: new THREE.Vector2() },
    uReducedMotion: { value: reducedMotionMediaQuery ? 1.0 : 0.0 },
  },
  vertexShader: PostprocessingShader.vertexShader,
  fragmentShader: PostprocessingShader.fragmentShader,
};

// Add these interfaces near the top of the file
interface ExtendedMesh extends THREE.Mesh {
  targetScale?: { x: number; y: number; z: number };
  groupIndex?: number;
  targetRotation?: number;
  animationDelay?: number; // Add delay property for staggered animation
  animationStartTime?: number; // Track when animation should start
}

function lerp(start: number, end: number, amount: number) {
  return start * (1 - amount) + end * amount;
}

// Create a custom shader pass component to avoid blinking
function CustomShaderPass() {
  const { size } = useThree();
  
  // Create the shader material once
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        uStrength: { value: new THREE.Vector2(0, 0) },
        uScreenRes: { value: new THREE.Vector2(size.width, size.height) },
        uReducedMotion: { value: reducedMotionMediaQuery ? 1.0 : 0.0 },
      },
      vertexShader: PostprocessingShader.vertexShader,
      fragmentShader: PostprocessingShader.fragmentShader,
    });
  }, [size]);
  
  // Create the shader pass once
  const shaderPass = useMemo(() => {
    return new ShaderPass(shaderMaterial);
  }, [shaderMaterial]);
  
  // Expose the material to the parent component
  useEffect(() => {
    shaderPass.enabled = true;
    return () => {
      shaderPass.enabled = false;
    };
  }, [shaderPass]);
  
  return <primitive object={shaderPass} />;
}

// Add this interface for the Image component props
interface ImageMaterialProps {
  grayscale?: number;
  zoom?: number;
  scale?: number;
  radius?: number;
}

// Update the GridTiles component to handle subgrid properly
function GridTiles({ tiles, groups, gridRefs }) {
  return groups.map((group, groupIndex) => (
    <group 
      key={`${'grid'}-group-${groupIndex}`} 
      ref={(el) => {
        if (el) {
          gridRefs.current[groupIndex].ref = el;
        }
      }}
      position={new THREE.Vector3(...group.pos)}
    >
      {tiles.map((tile, tileIndex) => {
        return (
          <Image
            key={`grid-tile-${groupIndex}-${tileIndex}`}
            position={new THREE.Vector3(...tile.pos)}
            userData={{ 
              row: tile.row, 
              col: tile.col,
              initialX: tile.pos[0],
              isHovered: false,
              isSelected: false
            }}
            rotation={[0, 0, 0]}
            url={tile.image}
            transparent
            scale={[TILE_WIDTH, TILE_HEIGHT, 1]}
            grayscale={1.0}
            zoom={1.0}
            radius={0.05}
          />
        );
      })}
    </group>
  ));
}

// Add at the top of the file, after other refs in Scene
let lastHoveredCenterTile = { row: null, col: null };
let hoverStartTime = 0;

// Move checkHover outside of the Scene component
const checkHover = (
  pointer: THREE.Vector2,
  camera: THREE.PerspectiveCamera,
  scene: THREE.Scene,
  clickedMeshRef: React.RefObject<ExtendedMesh>,
  mainGridSelectionRef: React.RefObject<ExtendedMesh>,
  gridGroupRefs: any,
  subgridGroupRefs: any,
  selectedRowRef: React.RefObject<number | null>,
  isRowLockedRef: React.RefObject<boolean>
) => {
  // No need to calculate mouse position, use the pointer directly
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(pointer, camera);

  // Find all meshes in the scene
  const meshes: ExtendedMesh[] = [];
  
  // Collect meshes from grid and subgrid groups instead of traversing the entire scene
  gridGroupRefs.current.forEach(({ ref }) => {
    ref.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        meshes.push(object as ExtendedMesh);
      }
    });
  });
  
  subgridGroupRefs.current.forEach(({ ref }) => {
    ref.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        meshes.push(object as ExtendedMesh);
      }
    });
  });

  // Reset hover state for all meshes
  meshes.forEach((mesh) => {
    if (mesh.userData.isHovered) {
      mesh.userData.isHovered = false;
      mesh.userData.needsUpdate = true;
    }
  });

  // Check for intersections
  const intersects = raycaster.intersectObjects(meshes, false);
  
  // Set hover state for the first intersected mesh
  if (intersects.length > 0) {
    const hoveredMesh = intersects[0].object as ExtendedMesh;
    // Only allow hover for main grid center column tiles
    const isMainGridTile = hoveredMesh.userData && typeof hoveredMesh.userData.col === 'number';
    const isCenterColumn = isMainGridTile && hoveredMesh.userData.col === Math.floor(GRID_TILES_X / 2);
    if (isMainGridTile && isCenterColumn) {
      hoveredMesh.userData.isHovered = true;
      hoveredMesh.userData.needsUpdate = true;
      // Track hovered center column tile
      if (
        hoveredMesh.userData &&
        typeof hoveredMesh.userData.col === 'number' &&
        hoveredMesh.userData.col === Math.floor(GRID_TILES_X / 2)
      ) {
        if (
          lastHoveredCenterTile.row !== hoveredMesh.userData.row ||
          lastHoveredCenterTile.col !== hoveredMesh.userData.col
        ) {
          lastHoveredCenterTile = {
            row: hoveredMesh.userData.row,
            col: hoveredMesh.userData.col,
          };
          hoverStartTime = performance.now();
        }
      } else {
        lastHoveredCenterTile = { row: null, col: null };
        hoverStartTime = 0;
      }
    } else {
      lastHoveredCenterTile = { row: null, col: null };
      hoverStartTime = 0;
    }
  } else {
    lastHoveredCenterTile = { row: null, col: null };
    hoverStartTime = 0;
  }

  // Update all mesh materials every frame, not just those that changed
  meshes.forEach((mesh) => {
    updateMesh(mesh, clickedMeshRef, mainGridSelectionRef, subgridGroupRefs, selectedRowRef, isRowLockedRef);
  });
};

// Scene component that contains all the 3D elements
function Scene() {
  const { camera, viewport, size, scene } = useThree();
  const scrollRef = useRef({
    ease: 0.05,
    scale: 0.02,
    current: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    last: { x: 0, y: 0 },
    position: { x: 0, y: 0 },
  });
 
  const isDownRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const screenRef = useRef({ width: 0, height: 0 });
  const viewportRef = useRef({ width: 0, height: 0 });
  const directionRef = useRef({ x: 1, y: 1 });
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const hoveredMeshRef = useRef<ExtendedMesh | null>(null);
  const clickedMeshRef = useRef<ExtendedMesh | null>(null);
  const isCenteringRef = useRef(false);
  const targetCenterRef = useRef({ x: 0, y: 0 });
  const isZoomingRef = useRef(false);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const targetZoomRef = useRef(BASE_ZOOM);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Add a new ref to track the main grid tile that opened the subgrid
  const mainGridSelectionRef = useRef<ExtendedMesh | null>(null);
  
  // Use the drei useCursor hook to change cursor based on state
  useCursor(hovered && !dragging, "pointer", "auto");
  useCursor(dragging, "grabbing", "auto");
  
  // Initialize groups with refs
  const gridGroupRefs = useRef(
    GRID_TILE_GROUPS.map(() => ({
      ref: new THREE.Group(),
      offset: { x: 0, y: 0 }
    }))
  );
  
  const subgridGroupRefs = useRef(
    SUBGRID_TILE_GROUPS.map(() => ({
      ref: new THREE.Group(),
      offset: { x: 0, y: 0 }
    }))
  );

  // Ref to store the current strength values for the shader
  const strengthRef = useRef({ x: 0, y: 0 });

  // Add a ref to track which tiles are in viewport
  const tilesInViewportRef = useRef<Set<ExtendedMesh>>(new Set());
  
  // Add a function to check if a mesh is in viewport
  const isInViewport = useCallback((mesh: ExtendedMesh) => {
    if (!mesh.parent) return false;
    
    // Get mesh world position
    const meshWorldPos = new THREE.Vector3();
    mesh.getWorldPosition(meshWorldPos);
    
    // Project to screen space
    meshWorldPos.project(camera);
    
    //bounds offset
    const BOUNDS_OFFSET_X = 200.;
    const BOUNDS_OFFSET_Y = 100;
    // Check if within screen bounds (-1 to 1 for both x and y)
    return (
      meshWorldPos.x >= -BOUNDS_OFFSET_X && 
      meshWorldPos.x <= BOUNDS_OFFSET_X && 
      meshWorldPos.y >= -BOUNDS_OFFSET_Y && 
      meshWorldPos.y <= BOUNDS_OFFSET_Y
    );
  }, [camera]);

  // Update viewport size on resize
  useEffect(() => {
    screenRef.current = {
      width: size.width,
      height: size.height,
    };
    
    // Update screen res uniform
    distortionShader.uniforms.uScreenRes.value.set(size.width, size.height);
    
    // Adjust camera and scroll settings based on screen size
    if (size.width < 768) {
      targetZoomRef.current = 20;
      scrollRef.current.scale = 0.08;
    } else {
      targetZoomRef.current = BASE_ZOOM;
      scrollRef.current.scale = 0.02;
    }
    
    // Calculate viewport size in world units
    const fov = camera.fov * (Math.PI / 180);
    const height = 2 * Math.tan(fov / 2) * camera.position.z;
    const width = height * camera.aspect;
    viewportRef.current = { height, width };
  }, [size, camera, distortionShader]);

  // Add this helper function to check if a mesh is part of the subgrid
  const isSubgridMesh = (mesh: THREE.Object3D) => {
    return subgridGroupRefs.current.some(({ ref }) => {
      return mesh.parent === ref;
    });
  };

  // Add this helper function to check if a subgrid tile is selected
  const isSubgridTileSelected = () => {
    return clickedMeshRef.current && isSubgridMesh(clickedMeshRef.current);
  };

  // Add at the top of the Scene component
  const isRowLockedRef = useRef(false);
  const selectedRowRef = useRef<number | null>(null);

  // --- Add state to track horizontal scroll offset for each row ---
  const rowScrollOffsetsRef = useRef(Array(GRID_TILES_Y).fill(0));

  // Event handlers
  useEffect(() => {
    const onTouchDown = (e: TouchEvent | MouseEvent) => {
      // Prevent scroll start if a subgrid tile is selected
      if (isSubgridTileSelected()) return;
      // Allow drag if a row is locked (for horizontal row scroll)
      if (isCenteringRef.current) return;
      isDownRef.current = true;
      isDraggingRef.current = false;
      
      scrollRef.current.position = {
        x: scrollRef.current.current.x,
        y: scrollRef.current.current.y,
      };
      
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      
      startPosRef.current.x = clientX;
      startPosRef.current.y = clientY;
      dragStartPosRef.current = { x: clientX, y: clientY };
     
      
      // Set dragging state and update zoom when mouse is down
      //setDragging(true);
      
      // Don't reset subgrid positions if a subgrid tile is selected
      if (!clickedMeshRef.current || !isSubgridMesh(clickedMeshRef.current)) {
        const isViewingSubgrid = clickedMeshRef.current && !isSubgridMesh(clickedMeshRef.current);
        targetZoomRef.current = isViewingSubgrid ? SUBGRID_DRAG_ZOOM : DRAG_ZOOM;
      }
      return;
    };

    const onTouchMove = (e: TouchEvent | MouseEvent) => {
      if (!isDownRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const dragDistance = Math.hypot(
        clientX - dragStartPosRef.current.x,
        clientY - dragStartPosRef.current.y
      );
      if (dragDistance > 5) {
        isDraggingRef.current = true;
      }
      const isMainGridRowSelected = !!mainGridSelectionRef.current;
      if (isMainGridRowSelected && mainGridSelectionRef.current) {
        // Only allow horizontal scroll for the selected row
        const distanceX = (startPosRef.current.x - clientX) * scrollRef.current.scale;
        const row = mainGridSelectionRef.current.userData.row;
        rowScrollOffsetsRef.current[row] = rowScrollOffsetsRef.current[row] - distanceX;
        startPosRef.current.x = clientX; // Update start position for smooth dragging
      } else {
        // Main grid row not selected: allow vertical scroll
        const distanceY = (startPosRef.current.y - clientY) * scrollRef.current.scale;
        scrollRef.current.target = {
          x: scrollRef.current.position.x ,
          y: scrollRef.current.position.y  + distanceY // Keep Y fixed for selected row
        };
      }
    };

    const onTouchUp = () => {
      isDownRef.current = false;
      // Reset dragging state and zoom
      setDragging(false);
      if (!isZoomingRef.current) {
        // Check if we're currently viewing subgrid
        const isViewingSubgrid = clickedMeshRef.current && !isSubgridMesh(clickedMeshRef.current);
        if (isViewingSubgrid) {
          targetZoomRef.current = SUBGRID_BASE_ZOOM;
        } else {
          targetZoomRef.current = screenRef.current.width < 768 ? 20 : BASE_ZOOM;
        }
      }
      
      setTimeout(() => {
        isDraggingRef.current = false;
      }, 0);
    };

    const onWheel = (e: WheelEvent) => {
      if (isCenteringRef.current) return;
      const normalized = normalizeWheel(e);

      const isMainGridRowSelected = !!mainGridSelectionRef.current;
      if (isMainGridRowSelected && mainGridSelectionRef.current) {
        // Only allow horizontal scroll for the selected row (match drag logic)
        const row = mainGridSelectionRef.current.userData.row;
        rowScrollOffsetsRef.current[row] -= normalized.pixelX * scrollRef.current.scale * 2;
      } else {
        // Main grid: only vertical scroll
        scrollRef.current.target.y += normalized.pixelY * scrollRef.current.scale;
      }
      e.preventDefault();
    };

    const onMouseMove = (event: MouseEvent) => {
      // Calculate mouse position in normalized device coordinates
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    
    const onClick = (event: MouseEvent) => {
      if (isDraggingRef.current) return;
      
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      
      // Collect all meshes from grid and subgrid groups
      const meshes: THREE.Object3D[] = [];
      gridGroupRefs.current.forEach(({ ref }) => {
        ref.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            meshes.push(object);
          }
        });
      });
      
      
      const intersects = raycasterRef.current.intersectObjects(meshes);
      
      // Get all meshes for animation
      const allMeshes: ExtendedMesh[] = [];
      gridGroupRefs.current.forEach(({ ref }) => {
        ref.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            allMeshes.push(object as ExtendedMesh);
          }
        });
      });
      
      
      // If we have a selected tile but clicked outside any tile
      if (intersects.length === 0) {
        if (clickedMeshRef.current && isSubgridMesh(clickedMeshRef.current)) {
          // Only a subgrid tile is selected, just unselect it
          clickedMeshRef.current.targetScale = { x: 1, y: 1, z: 1 };
          clickedMeshRef.current.animationStartTime = performance.now();
          clickedMeshRef.current = null;
        } else {
            // We have a main grid selection, so close everything
            const currentTime = performance.now();
            allMeshes.forEach((mesh) => {
              mesh.animationStartTime = currentTime;
              mesh.targetScale = { x: 1, y: 1, z: 1 };
              mesh.animationDelay = 100;
            });
            // Reset all selection states
            clickedMeshRef.current = null;
            // Reset row scroll offset for the specific row
            if (mainGridSelectionRef.current) {
              const row = mainGridSelectionRef.current.userData.row;
              rowScrollOffsetsRef.current[row] = 0; // Reset horizontal scroll offset for the specific row
            }
            mainGridSelectionRef.current = null;
            isZoomingRef.current = false;
            targetZoomRef.current = screenRef.current.width < 768 ? 20 : BASE_ZOOM;
            isRowLockedRef.current = false; // UNLOCK scroll
            selectedRowRef.current = null; // UNSELECT row
            // Reset the overall grid scroll to original position with easing
            targetCenterRef.current.x = 0; // Target the center
            targetCenterRef.current.y = scrollRef.current.current.y; // Preserve current Y position
            isCenteringRef.current = true; // Activate centering animation
          }
        return;
      }
      
      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object as ExtendedMesh;

        
        // Prevent selecting main grid tiles that are not in the center column
        if (clickedMesh.userData && typeof clickedMesh.userData.col === 'number' && clickedMesh.userData.col !== Math.floor(GRID_TILES_X / 2)) {
          return; // Ignore click, do not select or open subgrid
        }
        
        // Update previous clicked mesh material if different
        if (clickedMeshRef.current && clickedMeshRef.current !== clickedMesh) {
          clickedMeshRef.current.userData.isSelected = false;  
        }
        
        // Update new clicked mesh material
        clickedMesh.userData.isSelected = true;
        mainGridSelectionRef.current = clickedMesh;
        if (clickedMeshRef.current === clickedMesh) {
          
            // For main grid tiles, unselect and reset all selection state
            const currentTime = performance.now();
            allMeshes.forEach((mesh) => {
              mesh.animationStartTime = currentTime;
              mesh.targetScale = { x: 1, y: 1, z: 1 };
              mesh.animationDelay = 100;
            });
            clickedMeshRef.current = null;
            // Reset row scroll offset for the specific row
            if (mainGridSelectionRef.current) {
              const row = mainGridSelectionRef.current.userData.row;
              rowScrollOffsetsRef.current[row] = 0; // Reset horizontal scroll offset for the specific row
            }
            mainGridSelectionRef.current = null;
            isZoomingRef.current = false;
            targetZoomRef.current = screenRef.current.width < 768 ? 20 : BASE_ZOOM;
            isRowLockedRef.current = false; // UNLOCK scroll
            selectedRowRef.current = null; // UNSELECT row
            // Reset the overall grid scroll to original position with easing
            targetCenterRef.current.x = 0; // Target the center
            targetCenterRef.current.y = scrollRef.current.current.y; // Preserve current Y position
            isCenteringRef.current = true; // Activate centering animation
          
        } else {
          // Clicking a different tile
          let groupIndex = -1;
          gridGroupRefs.current.forEach(({ ref }, index) => {
            if (clickedMesh.parent === ref) {
              groupIndex = index;
            }
          });
          
          const currentTime = performance.now();
          const clickedPos = new THREE.Vector3().copy(clickedMesh.position);
          if (groupIndex !== -1) {
            clickedMeshRef.current = clickedMesh;
            clickedMeshRef.current.groupIndex = groupIndex;
            // Always keep the selected main grid tile at normal width
            clickedMeshRef.current.targetScale = { x: 1, y: 1, z: 1 };
            // Center the selected row vertically in the viewport
            const localY = clickedMesh.position.y;
            const j = Math.round((-localY + TILE_SPACE_X) / TILE_SPACE_X);
            const groupIndexY = Math.floor(groupIndex / 3);
            const groupRow = -(groupIndexY - 1);
            const groupOffset = gridGroupRefs.current[groupIndex].offset;
            targetCenterRef.current = {
              x: scrollRef.current.current.x,
              y: j * TILE_SPACE_Y - TILE_SPACE_Y - groupRow * GRID_SIZE_Y - groupOffset.y,
            };
            isCenteringRef.current = true;
            isRowLockedRef.current = true; // LOCK scroll
            selectedRowRef.current = clickedMesh.userData.row; // Store selected row
          } 
        }
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("mousewheel", onWheel, { passive: false });
    
    window.addEventListener("mousedown", onTouchDown);
    window.addEventListener("mousemove", onTouchMove);
    window.addEventListener("mouseup", onTouchUp);
    
    window.addEventListener("touchstart", onTouchDown);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchUp);
    
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("click", onClick);
    
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("mousewheel", onWheel);
      window.removeEventListener("mousedown", onTouchDown);
      window.removeEventListener("mousemove", onTouchMove);
      window.removeEventListener("mouseup", onTouchUp);
      window.removeEventListener("touchstart", onTouchDown);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchUp);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("click", onClick);
    };
  }, [camera]);

  
  // Set positions of grid groups based on scroll
  const setPositions = () => {
    let scrollX = scrollRef.current.current.x;
    let scrollY = scrollRef.current.current.y;

    // Only update grid positions if no tile is selected
    //if (!isZoomingRef.current) {
      
      const isMainGridRowSelected = !!mainGridSelectionRef.current;
      //console.log('isMainGridRowSelected', isMainGridRowSelected);
      gridGroupRefs.current.forEach(({ ref, offset }, i) => {
        const pos = GRID_TILE_GROUPS[i].pos;
        const posX = pos[0] + scrollX + offset.x;
        const posY = pos[1] + scrollY + offset.y;
        
        const dir = directionRef.current;
        const groupOff = GRID_SIZE_X;
        const viewportOff = {
          x: viewportRef.current.width / 2,
          y: viewportRef.current.height / 2,
        };

        ref.position.set(posX, posY, pos[2]);

        // Update positions of individual tiles within this group
        ref.children.forEach((child: ExtendedMesh) => {
          if (child.userData && typeof child.userData.row === 'number' && typeof child.userData.col === 'number') {
            const initialXPosition = child.userData.initialX;
            const row = child.userData.row;
            
            let targetChildX = initialXPosition;

            // Apply row-specific horizontal offset if a row is selected
            if (selectedRowRef.current !== null && row === selectedRowRef.current) {
              targetChildX = initialXPosition + rowScrollOffsetsRef.current[row];
            }
            
            // Lerp the child's X position to the target
            child.position.x = lerp(child.position.x, targetChildX, 0.1);
          }
        });

        // If a group is off screen move it to the opposite side of the entire grid
        // Horizontal
        if (dir.x < 0 && posX - groupOff > viewportOff.x) {
          gridGroupRefs.current[i].offset.x -= TOTAL_GRID_SIZE_X;
        } else if (dir.x > 0 && posX + groupOff < -viewportOff.x) {
          gridGroupRefs.current[i].offset.x += TOTAL_GRID_SIZE_X;
        }
        // Vertical
        if (dir.y < 0 && posY - groupOff > viewportOff.y) {
          gridGroupRefs.current[i].offset.y -= TOTAL_GRID_SIZE_Y;
        } else if (dir.y > 0 && posY + groupOff < -viewportOff.y) {
          gridGroupRefs.current[i].offset.y += TOTAL_GRID_SIZE_Y;
        }
      });
    //}
  };

  // Animation loop
  useFrame((state) => {
    // Pass the necessary refs to checkHover
    checkHover(
      state.pointer, 
      camera, 
      state.scene, 
      clickedMeshRef, 
      mainGridSelectionRef,
      gridGroupRefs,
      subgridGroupRefs,
      selectedRowRef,
      isRowLockedRef
    );

    //checkClicked();
    
    // Handle camera zoom
    if (camera) {
      camera.position.z = lerp(
        camera.position.z,
        targetZoomRef.current,
        0.05
      );
    }
    
    // Handle centering animation
    if (isCenteringRef.current) {
      const distanceX = targetCenterRef.current.x - scrollRef.current.current.x;
      const distanceY = targetCenterRef.current.y - scrollRef.current.current.y;
      
      // If we're close enough to the target, stop centering
      if (Math.abs(distanceX) < 0.01 && Math.abs(distanceY) < 0.01) {
        isCenteringRef.current = false;
      } else {
        // Set new target position with easing
        scrollRef.current.target = {
          x: lerp(scrollRef.current.current.x, targetCenterRef.current.x, 0.5),
          y: lerp(scrollRef.current.current.y, targetCenterRef.current.y, 0.5),
        };
      }
    }
    
    // Update scroll position with easing
    scrollRef.current.current = {
      x: lerp(
        scrollRef.current.current.x,
        scrollRef.current.target.x,
        scrollRef.current.ease
      ),
      y: lerp(
        scrollRef.current.current.y,
        scrollRef.current.target.y,
        scrollRef.current.ease
      ),
    };
    
    // Determine scroll direction
    // Vertical
    if (scrollRef.current.current.y > scrollRef.current.last.y) {
      directionRef.current.y = -1;
    } else if (scrollRef.current.current.y < scrollRef.current.last.y) {
      directionRef.current.y = 1;
    }
    // Horizontal
    if (scrollRef.current.current.x > scrollRef.current.last.x) {
      directionRef.current.x = -1;
    } else if (scrollRef.current.current.x < scrollRef.current.last.x) {
      directionRef.current.x = 1;
    }
    
    // Calculate new strength values
    const strengthX = Math.abs(
      ((scrollRef.current.current.x - scrollRef.current.last.x) /
        screenRef.current.width) *
        5 // Reduced from 10 to 5
    );
    const strengthY = Math.abs(
      ((scrollRef.current.current.y - scrollRef.current.last.y) /
        screenRef.current.width) *
        5 // Reduced from 10 to 5
    );
    
    // Store the strength values in the ref
    strengthRef.current = { x: strengthX, y: strengthY };
    
    setPositions();

  });

  return (
    <>
      {/* Add Environment for realistic lighting and reflections */}
      <Environment preset="city" />
      
      <GridTiles 
        tiles={GRID_TILES} 
        groups={GRID_TILE_GROUPS} 
        gridRefs={gridGroupRefs} 
      />
      
      {/* Reflective floor that appears only in subgrid mode */}
      <ReflectiveFloor 
        clickedMeshRef={clickedMeshRef} 
        subgridGroupRefs={subgridGroupRefs}
        mainGridSelectionRef={mainGridSelectionRef}
      />
      
      {/* Post-processing effects */}
      {/* <EffectComposer>
        <CustomShaderPass />
      </EffectComposer> */}
    </>
  );
}

// Add a new component for the reflective floor
function ReflectiveFloor({ clickedMeshRef, subgridGroupRefs, mainGridSelectionRef }) {
  const [visible, setVisible] = useState(false);
  const meshRef = useRef();
  const materialRef = useRef();
  const subgridModeStartTimeRef = useRef(null);
  const DELAY_MS = 1000; // 1 second delay
  
  // Helper function to check if a mesh is part of the subgrid
  const isSubgridMesh = useCallback((mesh) => {
    if (!mesh || !mesh.parent) return false;
    return subgridGroupRefs.current.some(({ ref }) => mesh.parent === ref);
  }, [subgridGroupRefs]);
  
  // Animate the floor opacity based on subgrid mode
  useFrame(() => {
    if (!meshRef.current || !materialRef.current) return;
    
    
    // Target opacity is higher when in subgrid mode AND delay has passed
    const targetOpacity = 0;

    // Adjust floor position based on whether a subgrid tile is selected
    const targetY = -1.25;
    
    // Smoothly animate the opacity
    materialRef.current.opacity = lerp(
      materialRef.current.opacity,
      targetOpacity,
      0.015
    );
    meshRef.current.position.y = lerp(
      meshRef.current.position.y,
      targetY,
      0.025
    );
    
    // Update visibility for optimization - only show when opacity is noticeable

    if (materialRef.current.opacity < .25) {
      meshRef.current.visible = false;
    } else {
      meshRef.current.visible = true;
    }
  });
  
  return (
    <mesh 
      ref={meshRef} 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, 0, 0]} // Fixed position below the scene
      visible={true} // Start hidden
    >
      <planeGeometry args={[50, 50]} />
      <MeshReflectorMaterial
        ref={materialRef}
        blur={[300, 300]}
        resolution={1024}
        mixBlur={1}
        mixStrength={15}
        roughness={1}
        depthScale={1.2}
        minDepthThreshold={0.3}
        maxDepthThreshold={1}
        color="#101010"
        metalness={1}
        transparent={true}
        opacity={0}
      />
    </mesh>
  );
}

// Helper function to lerp between colors
const lerpColor = (startColor: THREE.Color, endColor: THREE.Color, alpha: number): THREE.Color => {
  const result = new THREE.Color();
  result.r = startColor.r + (endColor.r - startColor.r) * alpha;
  result.g = startColor.g + (endColor.g - startColor.g) * alpha;
  result.b = startColor.b + (endColor.b - startColor.b) * alpha;
  return result;
};

// Update the updateMesh function to include the sine wave animation
const updateMesh = (
  mesh: ExtendedMesh, 
  clickedMeshRef: React.RefObject<ExtendedMesh>, 
  mainGridSelectionRef: React.RefObject<ExtendedMesh>,
  subgridGroupRefs: any,
  selectedRowRef: React.RefObject<number | null>,
  isRowLockedRef: React.RefObject<boolean>
) => {
  if (mesh.targetScale) {
    // Apply the scale with lerp for each dimension
    // Use the base width and height for all tiles
    const newScaleX = lerp(mesh.scale.x, mesh.targetScale.x * TILE_WIDTH, 0.075);
    const newScaleY = lerp(mesh.scale.y, mesh.targetScale.y * TILE_HEIGHT, 0.075);
    const newScaleZ = lerp(mesh.scale.z, mesh.targetScale.z, 0.075);
    mesh.scale.set(newScaleX, newScaleY, newScaleZ);
    //keeps image from stretching on scaling
    mesh.material.scale.set(newScaleX, newScaleY);
  }
    
  if (typeof mesh.targetRotation !== "undefined") {
    const currentRotation = mesh.rotation.y;
    const ROTATION_SPEED =  0.02;
    const newRotation = lerp(currentRotation, mesh.targetRotation, ROTATION_SPEED);
    mesh.rotation.y = newRotation;
  }
  if (!mesh.material || !(mesh.material instanceof THREE.ShaderMaterial)) return;
  
  const isHovered = mesh.userData.isHovered || false;
  const isSelected = mesh === clickedMeshRef.current;
  const isMainGridSelected = mesh === mainGridSelectionRef.current;
  
  // Check if this is a subgrid mesh
  const isSubgridMesh = (mesh: THREE.Object3D) => {
    return mesh.parent && subgridGroupRefs?.current?.some(({ ref }) => mesh.parent === ref);
  };
  
  // Check if any subgrid tile is selected
  const isAnySubgridTileSelected = clickedMeshRef.current && isSubgridMesh(clickedMeshRef.current);
  
  // Check if this is a non-selected subgrid tile when another subgrid tile is selected
  const isNonSelectedSubgridTile = isSubgridMesh(mesh) && isAnySubgridTileSelected && !isSelected;
  
  // Check if this is a main grid tile and not in the center column
  const isMainGridTile = mesh.userData && typeof mesh.userData.col === 'number' && !isSubgridMesh(mesh);
  const isNotCenterColumn = isMainGridTile && mesh.userData.col !== Math.floor(GRID_TILES_X / 2);
  // Check if this is a main grid tile in the same row as hovered center column tile
  const isSameRowAsHoveredCenter =
    isMainGridTile &&
    lastHoveredCenterTile.row !== null &&
    mesh.userData.row === lastHoveredCenterTile.row;
  // Ripple effect: delay based on distance from hovered center tile
  let rippleActive = false;
  let rippleProgress = 0;
  if (isSameRowAsHoveredCenter) {
    const baseDelay = 60; // ms per tile distance
    const distance = Math.abs(mesh.userData.col - Math.floor(GRID_TILES_X / 2)); // 0 for center, 1 for sides
    const delay = baseDelay * distance;
    if (hoverStartTime) {
      const elapsed = performance.now() - hoverStartTime - delay;
      if (elapsed > 0) {
        rippleActive = true;
        // Clamp progress between 0 and 1 over 400ms
        rippleProgress = Math.min(1, elapsed / 400);
      }
    }
  }
  
  // Initialize target values if they don't exist
  if (mesh.userData.targetMaterial === undefined) {
    mesh.userData.targetMaterial = {
      grayscale: 0.7,
      zoom: 1.0,
      radius: 0.05,
      color: new THREE.Color("#777")
    };
  }
  
  // Get current time for sine wave calculation
  const time = performance.now() * 0.001; // Convert to seconds
  const sineWave = Math.sin(time * 1) * 0.075 + 1.1 ; // Same formula as in Gallery.tsx
  
  // Set target material properties based on state
  const isInSelectedRow = isMainGridTile && selectedRowRef && selectedRowRef.current !== null && mesh.userData.row === selectedRowRef.current;
  const isRowLocked = isRowLockedRef && isRowLockedRef.current;
  if ((isRowLocked && isInSelectedRow) || isSelected || isMainGridSelected) {
    // Selected state for all tiles in locked row
    mesh.userData.targetMaterial.grayscale = 0.0; // Full color
    mesh.userData.targetMaterial.radius = 0.025;
    mesh.userData.targetMaterial.zoom = 1 * sineWave; // Apply sine wave to zoom
    mesh.userData.targetMaterial.color = new THREE.Color("#fff"); // White
  } else if (isNonSelectedSubgridTile) {
    // Non-selected subgrid tile when another is selected - make darker
    mesh.userData.targetMaterial.grayscale = 0.9; // More grayscale
    mesh.userData.targetMaterial.zoom = 1.0; // No zoom
    mesh.userData.targetMaterial.radius = 0.05;
    mesh.userData.targetMaterial.color = new THREE.Color("#333"); // Darker gray
  } else if (isRowLocked && isMainGridTile && !isInSelectedRow) {
    // When row is locked, make all other main grid tiles dark
    mesh.userData.targetMaterial.grayscale = 0.95;
    mesh.userData.targetMaterial.zoom = 1.0;
    mesh.userData.targetMaterial.radius = 0.05;
    mesh.userData.targetMaterial.color = new THREE.Color("#222"); // Very dark gray
  } else if (isHovered) {
    // Hovered state
    mesh.userData.targetMaterial.radius = 0.05;
    mesh.userData.targetMaterial.grayscale = 0.5; // Slight grayscale
    mesh.userData.targetMaterial.zoom = 1.5 * sineWave; // Apply sine wave to zoom
    mesh.userData.targetMaterial.color = new THREE.Color("#fff"); // Light gray
    if(isSubgridMesh(mesh)) mesh.targetScale = { x: 1, y: 1.25, z: 1 };
  } else if (isSameRowAsHoveredCenter && rippleActive) {
    // Ripple: lighten tiles in the same row as hovered center, with elastic ease
    const ease = elasticOut(rippleProgress);
    mesh.userData.targetMaterial.radius = 0.05;
    mesh.userData.targetMaterial.grayscale = lerp(0.95, 0.9, ease);
    mesh.userData.targetMaterial.zoom = 1.;
    mesh.userData.targetMaterial.color = lerpColor(new THREE.Color("#222"), new THREE.Color("#777"), ease);
  } else if (isNotCenterColumn) {
    // Main grid tile not in center column: darken a lot
    mesh.userData.targetMaterial.grayscale = 0.95;
    mesh.userData.targetMaterial.zoom = 1.0;
    mesh.userData.targetMaterial.radius = 0.05;
    mesh.userData.targetMaterial.color = new THREE.Color("#222"); // Very dark gray
  } else {
    // Default state - ensure we're setting fixed values here, not animated ones
    mesh.userData.targetMaterial.grayscale = 0.7; // More grayscale
    mesh.userData.targetMaterial.zoom = 1.0; // No zoom animation for default state
    mesh.userData.targetMaterial.radius = 0.05; // Default corners
    mesh.userData.targetMaterial.color = new THREE.Color("#777"); // Gray
  }
  
  // Lerp current values toward target values
  const lerpFactor = isHovered || isSelected || isMainGridSelected ? 0.02 : 0.02; // Faster transition to active states, slower to default
  
  // Lerp material uniforms
  mesh.material.uniforms.grayscale.value = lerp(
    mesh.material.uniforms.grayscale.value,
    mesh.userData.targetMaterial.grayscale,
    lerpFactor
  );
  
  mesh.material.uniforms.zoom.value = lerp(
    mesh.material.uniforms.zoom.value,
    mesh.userData.targetMaterial.zoom,
    lerpFactor
  );
  
  mesh.material.uniforms.radius.value = lerp(
    mesh.material.uniforms.radius.value,
    mesh.userData.targetMaterial.radius,
    lerpFactor
  );
  
  // Lerp color
  const currentColor = mesh.material.uniforms.color.value;
  const targetColor = mesh.userData.targetMaterial.color;
  
  mesh.material.uniforms.color.value = lerpColor(
    currentColor,
    targetColor,
    lerpFactor
  );
};

export const GalleryInfinite3 = () => {
  return (
    <div
      style={{
        display: "flex",
        top: 0,
        bottom: 0,
        left: 0,
        margin:'auto',
        width: "100%",
        height: "66%",
      }}
    >
      <Canvas
        camera={{
          position: [0, 0, 10], 
          fov: 45,
          near: 1,
          far: 1000
        }}
        gl={{ 
          antialias: true,
          alpha: false,
          preserveDrawingBuffer: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        dpr={[1, 1.5]}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 1)}
      >
        <Scene />
        {/* {process.env.NODE_ENV === 'development' && <Perf position="top-left" />} */}
      </Canvas>
    </div>
  );
};
