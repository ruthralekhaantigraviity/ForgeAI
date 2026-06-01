import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const RoboticBackground = () => {
  const [nodes, setNodes] = useState([]);

  useEffect(() => {
    // Generate random nodes for the neural network effect
    const newNodes = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      duration: Math.random() * 10 + 15,
      delay: Math.random() * 5
    }));
    setNodes(newNodes);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 dark:opacity-30 z-0">
      {/* Tech Grid Pattern */}
      <div 
        className="absolute inset-0" 
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(56, 189, 248, 0.15) 1px, transparent 0)',
          backgroundSize: '48px 48px'
        }}
      ></div>

      {/* Floating Nodes */}
      {nodes.map(node => (
        <motion.div
          key={node.id}
          className="absolute rounded-full bg-brand-500 shadow-[0_0_15px_rgba(167,139,250,0.8)]"
          style={{
            width: node.size,
            height: node.size,
            left: `${node.x}%`,
            top: `${node.y}%`
          }}
          animate={{
            y: [0, -40, 0, 40, 0],
            x: [0, 30, 0, -30, 0],
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: node.duration,
            repeat: Infinity,
            ease: "linear",
            delay: node.delay
          }}
        />
      ))}

      {/* Scanning Laser Line */}
      <motion.div 
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-600 to-transparent shadow-[0_0_12px_rgba(56,189,248,0.9)]"
        animate={{
          top: ['-10%', '110%', '-10%']
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );
};

export default RoboticBackground;
