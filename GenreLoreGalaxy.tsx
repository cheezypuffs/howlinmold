/**
 * Genre Lore Galaxy - 3D Visualization of Genre Articles as Clustered Nebulas
 * 
 * Displays CSV genre lore articles as a navigable 3D galaxy where:
 * - Each genre = A nebula cluster
 * - Each article = A node within that nebula
 * - CSV data parsed and visualized with D3 force layout
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Sparkles, Line } from '@react-three/drei';
import { motion, AnimatePresence } from './motion';
import * as Icons from './Icons';
import { Button } from './ui/button';

// Simple CSV line parser that handles quoted fields
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last field
  result.push(current.trim());
  return result;
};


// Helper hook for keyboard controls
const useKeyboardControls = () => {
  const keys = useRef({ w: false, a: false, s: false, d: false });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent handling events when typing in an input
      if ((event.target as HTMLElement).tagName === 'INPUT' || (event.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }
      switch (event.key.toLowerCase()) {
        case 'w': keys.current.w = true; break;
        case 'a': keys.current.a = true; break;
        case 's': keys.current.s = true; break;
        case 'd': keys.current.d = true; break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case 'w': keys.current.w = false; break;
        case 'a': keys.current.a = false; break;
        case 's': keys.current.s = false; break;
        case 'd': keys.current.d = false; break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return keys;
};

// Component to handle camera movement with WASD keys
// FIX: Corrected camera movement logic to prevent inconsistent speeds.
const WASDCameraControls: React.FC<{ speed?: number }> = ({ speed = 1.0 }) => {
  const { camera, controls } = useThree();
  const keys = useKeyboardControls();

  useFrame((state, delta) => {
    // The `controls` object from useThree might be null or not OrbitControls
    if (!controls || !('target' in controls)) return;

    const moveSpeed = speed * delta * 50; // Adjust speed with delta time

    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    
    const right = new THREE.Vector3();
    right.crossVectors(camera.up, forward).negate();

    const moveDirection = new THREE.Vector3();

    if (keys.current.w) moveDirection.add(forward);
    if (keys.current.s) moveDirection.sub(forward);
    if (keys.current.a) moveDirection.add(right.clone().negate());
    if (keys.current.d) moveDirection.add(right);


    if (moveDirection.length() > 0) {
      moveDirection.normalize().multiplyScalar(moveSpeed);

      camera.position.add(moveDirection);
      // This is crucial: move the OrbitControls target along with the camera
      (controls as any).target.add(moveDirection);
    }
  });

  return null;
};


interface ArticleNode {
  id: string;
  title: string;
  genre: string;
  category: string;
  year?: number;
  artist?: string;
  album?: string;
  author?: string;
  summary?: string;
  content?: string;
  tags?: string[];
  position?: [number, number, number];
  resonance?: number; // For visualization size/importance
}

interface Edge {
  source: string;
  target: string;
}

interface GenreLoreGalaxyProps {
  genreId?: string;
  onNodeClick?: (node: ArticleNode) => void;
  className?: string;
}

// Genre-specific nebula colors
const GENRE_COLORS: Record<string, string> = {
  'techno': '#00ffff',    // Cyan
  'house': '#ff6b9d',     // Pink
  'dnb': '#2ce1d0',      // Teal
  'ambient': '#d6b55d',   // Gold
  'default': '#8b5cf6',  // Purple
};

const ArticleEdges: React.FC<{ articles: ArticleNode[]; edges: Edge[]; selectedNode: ArticleNode | null }> = ({ articles, edges, selectedNode }) => {
    const articleMap = useMemo(() => new Map(articles.map(a => [a.id, a])), [articles]);

    // Render all edges with one efficient lineSegments object
    const allLinesGeometry = useMemo(() => {
        const points: THREE.Vector3[] = [];
        edges.forEach(edge => {
            const sourceNode = articleMap.get(edge.source);
            const targetNode = articleMap.get(edge.target);

            if (sourceNode?.position && targetNode?.position) {
                points.push(new THREE.Vector3(...sourceNode.position));
                points.push(new THREE.Vector3(...targetNode.position));
            }
        });
        return new THREE.BufferGeometry().setFromPoints(points);
    }, [edges, articleMap]);

    // Render highlighted edges separately for better styling (e.g., thickness)
    const highlightedEdges = useMemo(() => {
        if (!selectedNode) return [];

        return edges
            .filter(edge => edge.source === selectedNode.id || edge.target === selectedNode.id)
            .map(edge => {
                const sourceNode = articleMap.get(edge.source);
                const targetNode = articleMap.get(edge.target);
                if (sourceNode?.position && targetNode?.position) {
                    return {
                        start: sourceNode.position,
                        end: targetNode.position
                    };
                }
                return null;
            }).filter((e): e is { start: [number, number, number], end: [number, number, number] } => e !== null);

    }, [edges, articleMap, selectedNode]);

    const highlightColor = selectedNode ? (GENRE_COLORS[selectedNode.genre] || GENRE_COLORS.default) : 'white';

    return (
        <>
            <lineSegments geometry={allLinesGeometry}>
                <lineBasicMaterial color="#ffffff" transparent opacity={0.1} />
            </lineSegments>
            
            {highlightedEdges.map((edge, i) => (
                <Line
                    key={`hl-${i}`}
                    points={[edge.start, edge.end]}
                    color={highlightColor}
                    lineWidth={2}
                    dashed={false}
                    opacity={0.9}
                    transparent
                />
            ))}
        </>
    );
};

// Article Node component
interface ArticleNodeProps {
  article: ArticleNode;
  isSelected?: boolean;
  onClick?: () => void;
}

const ArticleNodeComponent: React.FC<ArticleNodeProps> = ({ article, isSelected, onClick }) => {
  const meshRef = React.useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const { camera } = useThree();

  const color = isSelected ? '#ffffff' : (GENRE_COLORS[article.genre] || GENRE_COLORS.default);
  const size = (article.resonance || 0.5) * 1.5 + (isSelected ? 1 : 0);

  useFrame(() => {
    if (meshRef.current && article.position) {
      meshRef.current.position.lerp(new THREE.Vector3(...article.position), 0.1);
    }
    if (isSelected && meshRef.current) {
        meshRef.current.quaternion.copy(camera.quaternion);
    }
  });

  return (
    <group position={article.position}>
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick?.(); }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={isSelected ? 1.5 : 1}
      >
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 0.8 : (hovered ? 0.5 : 0.2)}
          metalness={0.1}
          roughness={0.8}
          transparent
          opacity={0.9}
        />
      </mesh>
      {(isSelected || hovered) && (
        <mesh scale={1.5}>
          <ringGeometry args={[size * 1.1, size * 1.3, 32]} />
          <meshBasicMaterial
            color={color}
            opacity={0.5}
            transparent
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      <Html
        position={[0, size + 1.5, 0]}
        center
        occlude={[meshRef]}
        className="pointer-events-none"
      >
        <AnimatePresence>
          {(isSelected || hovered) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-black/60 backdrop-blur-sm p-2 rounded-lg text-white text-xs whitespace-nowrap"
            >
              {article.title}
            </motion.div>
          )}
        </AnimatePresence>
      </Html>
    </group>
  );
};

const ArticleDetailModal: React.FC<{ article: ArticleNode | null; onClose: () => void; }> = ({ article, onClose }) => {
    if (!article) return null;
    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div className="bg-slate-900 border border-white/20 p-6 rounded-lg max-w-lg w-full">
                <h2 className="text-2xl font-bold text-white">{article.title}</h2>
                <p className="text-purple-300">{article.artist}</p>
                <p className="text-slate-400 mt-4">{article.summary}</p>
                <Button onClick={onClose} className="mt-6">Close</Button>
            </div>
        </motion.div>
    );
};

const GenreLoreGalaxy: React.FC<GenreLoreGalaxyProps> = ({
  genreId,
  onNodeClick,
  className = '',
}) => {
  const [articles, setArticles] = useState<ArticleNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<ArticleNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [genreClusters, setGenreClusters] = useState<Map<string, ArticleNode[]>>(new Map());

  // Load and parse CSV data
  useEffect(() => {
    const loadArticles = async () => {
      setLoading(true);
      try {
        // Parse CSV data for each genre
        const genres = ['techno', 'house', 'dnb', 'ambient'];
        const allArticles: ArticleNode[] = [];
        const clusters = new Map<string, ArticleNode[]>();

        await Promise.all(
          genres.map(async (genre) => {
            try {
              const response = await fetch(`/data/csv/${genre}.csv`);
              const csvText = await response.text();
              
              // Parse CSV with proper handling of quoted fields
              const lines = csvText.split('\n').filter(l => l.trim());
              if (lines.length < 2) return;
              const headers = parseCSVLine(lines[0]);
              
              lines.slice(1).forEach((line, idx) => {
                if (!line.trim()) return;
                
                const values = parseCSVLine(line);
                const row: any = {};
                headers.forEach((header, i) => {
                  row[header.trim()] = values[i]?.trim().replace(/^"(.*)"$/, '$1') || '';
                });

                const article: ArticleNode = {
                  id: `${genre}_${idx}`,
                  title: row['Track Name'] || `Track ${idx}`,
                  genre,
                  category: row['Genres'] || genre,
                  year: parseInt(row['Release Date']?.split('-')[0] || '1970', 10),
                  artist: row['Artist Name(s)'],
                  album: row['Album Name'],
                  summary: 'Summary not available in this dataset.',
                  tags: row['Genres'] ? row['Genres'].split(',') : [],
                  resonance: (parseInt(row['Popularity'], 10) || 50) / 100,
                  // position is calculated later
                };
                allArticles.push(article);
                if (!clusters.has(genre)) {
                  clusters.set(genre, []);
                }
                clusters.get(genre)!.push(article);
              });
            } catch (e) {
              console.error(`Error loading articles for ${genre}:`, e);
            }
          })
        );
        
        // Position nodes in clusters
        clusters.forEach((clusterArticles, genre) => {
          const genreIndex = genres.indexOf(genre);
          const angle = (genreIndex / genres.length) * Math.PI * 2;
          const clusterRadius = 80;
          const clusterCenter: [number, number, number] = [
            Math.cos(angle) * clusterRadius,
            0,
            Math.sin(angle) * clusterRadius
          ];

          clusterArticles.forEach((article, idx) => {
              const r = Math.sqrt(Math.random()) * 30; // Spread within cluster
              const theta = Math.random() * Math.PI * 2;
              article.position = [
                  clusterCenter[0] + r * Math.cos(theta),
                  (Math.random() - 0.5) * 20, // Vertical spread
                  clusterCenter[2] + r * Math.sin(theta),
              ];
          });
        });


        setArticles(allArticles);
        setGenreClusters(clusters);
      } catch (e) {
        console.error("Error loading genre lore data:", e);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, []);

  const edges = useMemo(() => {
    const newEdges: Edge[] = [];
    genreClusters.forEach((clusterArticles) => {
        for (let i = 0; i < clusterArticles.length; i++) {
            for (let j = i + 1; j < clusterArticles.length; j++) {
                // simple connection logic for demo
                if (Math.random() > 0.8) { 
                    newEdges.push({ source: clusterArticles[i].id, target: clusterArticles[j].id });
                }
            }
        }
    });
    return newEdges;
  }, [genreClusters]);

  if (loading) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Icons.Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p>Building the cosmos...</p>
          </div>
      );
  }

  return (
    <div className={`w-full h-full relative ${className}`}>
        <Canvas camera={{ position: [0, 50, 150], fov: 60 }}>
            <ambientLight intensity={0.2} />
            <pointLight position={[100, 100, 100]} intensity={1.5} />
            <pointLight position={[-100, -100, -100]} intensity={0.8} color="#8b5cf6" />
            <Sparkles count={500} scale={200} size={1} speed={0.2} />

            {articles.map(article => (
                <ArticleNodeComponent
                    key={article.id}
                    article={article}
                    isSelected={selectedNode?.id === article.id}
                    onClick={() => {
                        setSelectedNode(article);
                        onNodeClick?.(article);
                    }}
                />
            ))}
            
            <ArticleEdges articles={articles} edges={edges} selectedNode={selectedNode} />

            <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
            <WASDCameraControls speed={1.0} />
        </Canvas>
        
        <AnimatePresence>
            <ArticleDetailModal article={selectedNode} onClose={() => setSelectedNode(null)} />
        </AnimatePresence>
        
        <div className="absolute top-4 left-4 bg-black/50 p-2 rounded-lg text-white text-xs backdrop-blur-sm">
            <p>Use WASD to fly, mouse to orbit.</p>
        </div>
    </div>
  );
};

export default GenreLoreGalaxy;