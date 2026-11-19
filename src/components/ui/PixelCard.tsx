import { motion } from 'framer-motion';

type Props = {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
};

export default function PixelCard({ children, className = '', glow = false }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative bg-navy/70 backdrop-blur-md border border-cyan-glow/20 ${
        glow ? 'pixel-border-strong' : 'pixel-border'
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}
