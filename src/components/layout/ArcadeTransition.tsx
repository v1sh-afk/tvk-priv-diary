import { motion } from 'framer-motion';

export default function ArcadeTransition({ identity }: { identity: 'V' | 'T' }) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] grid place-items-center bg-navy-deep"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-center">
        <motion.div
          className="font-arcade text-cyan-glow rgb-text text-sm sm:text-base mb-6"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          WELCOME, {identity}
        </motion.div>
        <motion.div
          className="flex justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-3 h-3 bg-cyan-glow"
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
              style={{ imageRendering: 'pixelated' }}
            />
          ))}
        </motion.div>
        <motion.p
          className="font-arcade text-[0.5rem] text-muted mt-6 tracking-widest"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          LOADING WORLD…
        </motion.p>
      </div>
    </motion.div>
  );
}
