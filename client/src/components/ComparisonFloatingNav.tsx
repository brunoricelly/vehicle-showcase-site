import { useComparison } from "@/contexts/ComparisonContext";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, X } from "lucide-react";

export default function ComparisonFloatingNav() {
  const { selectedVehicles, clearComparison } = useComparison();
  const [, setLocation] = useLocation();

  if (selectedVehicles.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="fixed bottom-6 left-6 z-30 md:left-auto md:right-6"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-card border-2 border-primary rounded-lg shadow-2xl p-4 md:p-5 backdrop-blur-sm bg-opacity-95"
        >
          <div className="flex items-center gap-4">
            {/* Ícone e Contador */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex items-center gap-2"
            >
              <div className="relative">
                <Scale size={24} className="text-primary" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                >
                  {selectedVehicles.length}
                </motion.div>
              </div>
              <div className="hidden md:block">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                  Comparação
                </p>
                <p className="text-sm font-light text-foreground">
                  {selectedVehicles.length} de 3 selecionados
                </p>
              </div>
            </motion.div>

            {/* Botões */}
            <div className="flex gap-2 md:gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLocation("/comparison")}
                className="px-4 py-2 bg-primary text-primary-foreground rounded text-xs md:text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Ver Comparação
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearComparison}
                className="p-2 hover:bg-muted rounded transition-colors"
                title="Limpar comparação"
              >
                <X size={18} className="text-muted-foreground hover:text-foreground" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
