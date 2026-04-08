import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useComparison } from "@/contexts/ComparisonContext";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, MessageCircle } from "lucide-react";
import { useStoreSettings } from "@/hooks/useStoreSettings";

export default function ComparisonPage() {
  const [, setLocation] = useLocation();
  const { selectedVehicles, removeVehicle, clearComparison } = useComparison();
  const { settings: storeSettings } = useStoreSettings();
  const [imageIndices, setImageIndices] = useState<Record<number, number>>({});

  if (selectedVehicles.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-muted-foreground mb-6 text-lg">
            Nenhum veículo selecionado para comparação
          </p>
          <Button onClick={() => setLocation("/")} className="premium-button">
            Voltar para Catálogo
          </Button>
        </motion.div>
      </div>
    );
  }

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numPrice);
  };

  const handlePrevImage = (vehicleId: number, imagesLength: number) => {
    setImageIndices((prev) => ({
      ...prev,
      [vehicleId]: (prev[vehicleId] || 0) === 0 ? imagesLength - 1 : (prev[vehicleId] || 0) - 1,
    }));
  };

  const handleNextImage = (vehicleId: number, imagesLength: number) => {
    setImageIndices((prev) => ({
      ...prev,
      [vehicleId]: ((prev[vehicleId] || 0) + 1) % imagesLength,
    }));
  };

  const specs = [
    { label: "Marca", key: "brand" },
    { label: "Modelo", key: "model" },
    { label: "Ano", key: "year" },
    { label: "Quilometragem", key: "mileage", format: (v: any) => v ? `${v.toLocaleString("pt-BR")} KM` : "N/A" },
    { label: "Categoria", key: "category", format: (v: any) => v?.charAt(0).toUpperCase() + v?.slice(1) },
    { label: "Cor", key: "color" },
    { label: "Transmissão", key: "transmission", format: (v: any) => v?.charAt(0).toUpperCase() + v?.slice(1) },
    { label: "Preço", key: "price", format: formatPrice },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border-b border-border py-4 sticky top-0 z-40 backdrop-blur-sm bg-opacity-95"
      >
        <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <motion.button
              whileHover={{ x: -4 }}
              onClick={() => setLocation("/")}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronLeft size={20} />
              <span className="text-sm">Voltar</span>
            </motion.button>
            <h1 className="text-2xl md:text-3xl font-bold">Comparação de Veículos</h1>
            <div className="w-20"></div>
          </div>
          <div className="flex gap-3">
            <p className="text-sm text-muted-foreground">
              {selectedVehicles.length} de 3 veículos selecionados
            </p>
            {selectedVehicles.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearComparison}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Limpar Comparação
              </motion.button>
            )}
          </div>
        </div>
      </motion.header>

      {/* Comparação */}
      <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {selectedVehicles.map((vehicle, idx) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="border border-border rounded-lg overflow-hidden bg-card"
            >
              {/* Cabeçalho do Card */}
              <div className="bg-muted p-4 border-b border-border flex items-center justify-between">
                <h2 className="font-bold text-lg">
                  {vehicle.brand} {vehicle.model}
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeVehicle(vehicle.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X size={20} />
                </motion.button>
              </div>

              {/* Galeria de Imagens */}
              <div className="relative w-full h-64 bg-muted overflow-hidden group">
                {vehicle.images && vehicle.images.length > 0 ? (
                  <>
                    <motion.img
                      key={imageIndices[vehicle.id] || 0}
                      src={vehicle.images[imageIndices[vehicle.id] || 0]?.imageUrl}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="w-full h-full object-cover"
                    />

                    {/* Contador de imagens */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute bottom-3 right-3 bg-black/60 px-2 py-1 rounded text-xs text-white"
                    >
                      {(imageIndices[vehicle.id] || 0) + 1} / {vehicle.images.length}
                    </motion.div>

                    {/* Controles de navegação */}
                    {vehicle.images.length > 1 && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => handlePrevImage(vehicle.id, vehicle.images!.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <ChevronLeft size={18} className="text-white" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => handleNextImage(vehicle.id, vehicle.images!.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <ChevronRight size={18} className="text-white" />
                        </motion.button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    Sem imagem disponível
                  </div>
                )}
              </div>

              {/* Especificações */}
              <div className="p-6 space-y-4">
                {specs.map((spec) => (
                  <motion.div
                    key={spec.key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="border-b border-border pb-3 last:border-b-0"
                  >
                    <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-1">
                      {spec.label}
                    </p>
                    <p className="text-sm font-light text-foreground">
                      {spec.format
                        ? spec.format((vehicle as any)[spec.key])
                        : (vehicle as any)[spec.key] || "N/A"}
                    </p>
                  </motion.div>
                ))}

                {/* Descrição */}
                {vehicle.description && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="border-t border-border pt-4 mt-4"
                  >
                    <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-2">
                      Descrição
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed font-light line-clamp-3">
                      {vehicle.description}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="p-4 border-t border-border"
              >
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={`https://wa.me/${storeSettings.phone?.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="premium-button w-full flex items-center justify-center gap-2 block text-center text-sm"
                >
                  <MessageCircle size={16} />
                  Consultar via WhatsApp
                </motion.a>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Botão para adicionar mais veículos */}
        {selectedVehicles.length < 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 text-center"
          >
            <Button
              onClick={() => setLocation("/")}
              variant="outline"
              className="px-8 py-3"
            >
              Adicionar Mais Veículos
            </Button>
          </motion.div>
        )}
      </div>

      {/* WhatsApp Floating Button */}
      <motion.a
        href={`https://wa.me/${storeSettings.phone?.replace(/\D/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 w-14 h-14 md:w-16 md:h-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow z-40"
      >
        <MessageCircle size={24} />
      </motion.a>
    </div>
  );
}
