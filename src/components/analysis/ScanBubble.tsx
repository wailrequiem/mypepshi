import { motion } from "framer-motion";
import { Camera } from "lucide-react";

interface ScanBubbleProps {
  isScanning?: boolean;
  onStartScan?: () => void;
}

export function ScanBubble({ isScanning = false, onStartScan }: ScanBubbleProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="relative flex items-center justify-center"
      onClick={onStartScan}
    >
      {/* Outer glow rings */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-80 h-80 rounded-full border border-primary/20"
      />
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
        className="absolute w-96 h-96 rounded-full border border-primary/10"
      />

      {/* Main bubble */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative w-72 h-72 rounded-full glass-strong cursor-pointer flex items-center justify-center glow-accent-subtle overflow-hidden"
      >
        {/* Scanning animation overlay */}
        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0"
          >
            <motion.div
              animate={{ y: ["-100%", "200%"] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-x-0 h-1/3 bg-gradient-to-b from-transparent via-primary/30 to-transparent"
            />
          </motion.div>
        )}

        {/* Center content */}
        <motion.div
          animate={isScanning ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 1, repeat: isScanning ? Infinity : 0 }}
          className="flex flex-col items-center"
        >
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <Camera className="w-10 h-10 text-primary" />
          </div>
          {isScanning && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-primary font-medium"
            >
              Analyzing...
            </motion.p>
          )}
        </motion.div>

        {/* Corner accents */}
        <div className="absolute top-8 left-8 w-8 h-8 border-l-2 border-t-2 border-primary/40 rounded-tl-xl" />
        <div className="absolute top-8 right-8 w-8 h-8 border-r-2 border-t-2 border-primary/40 rounded-tr-xl" />
        <div className="absolute bottom-8 left-8 w-8 h-8 border-l-2 border-b-2 border-primary/40 rounded-bl-xl" />
        <div className="absolute bottom-8 right-8 w-8 h-8 border-r-2 border-b-2 border-primary/40 rounded-br-xl" />
      </motion.div>
    </motion.div>
  );
}
