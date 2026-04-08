import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { motion, useScroll, useTransform } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, MessageCircle, Scale } from "lucide-react";
import { useComparison } from "@/contexts/ComparisonContext";
import { useStoreSettings } from "@/hooks/useStoreSettings";

export default function VehicleDetail() {
  const [, params] = useRoute("/vehicle/:id");
  const [, setLocation] = useLocation();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { addVehicle, isVehicleSelected, canAddMore } = useComparison();
  const { settings: storeSettings } = useStoreSettings();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 200], [1, 0.5]);

  const vehicleId = params?.id ? parseInt(params.id, 10) : null;
  const { data: vehicle, isLoading } = trpc.vehicles.getById.useQuery(
    { id: vehicleId! },
    { enabled: !!vehicleId }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-muted-foreground"
        >
          Carregando detalhes do veículo...
        </motion.p>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Veículo não encontrado</p>
          <Button onClick={() => setLocation("/")} className="premium-button">
            Voltar para Home
          </Button>
        </div>
      </div>
    );
  }

  const images = vehicle.images || [];
  const currentImage = images[selectedImageIndex];

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numPrice);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border-b border-border py-4 sticky top-0 z-40 backdrop-blur-sm bg-opacity-95"
      >
        <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex items-center justify-between">
          <motion.button
            whileHover={{ x: -4 }}
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="text-sm">Voltar</span>
          </motion.button>
          <h1 className="text-xl md:text-2xl font-bold">
            {vehicle.brand} {vehicle.model}
          </h1>
          <div className="w-16"></div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 md:gap-16">
          {/* Galeria de Imagens */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            {/* Imagem Principal */}
            <motion.div
              style={{ opacity }}
              className="relative w-full h-96 md:h-[500px] bg-muted rounded-lg overflow-hidden mb-6 group cursor-pointer"
              onClick={() => setLightboxOpen(true)}
            >
              {currentImage?.imageUrl ? (
                <motion.img
                  key={selectedImageIndex}
                  src={currentImage.imageUrl}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Sem imagem disponível
                </div>
              )}

              {/* Overlay com zoom hint */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-black/20 flex items-center justify-center"
              >
                <p className="text-white text-sm font-light">Clique para ampliar</p>
              </motion.div>

              {/* Contador de imagens */}
              {images.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute bottom-4 right-4 bg-black/60 px-3 py-1 rounded text-xs text-white"
                >
                  {selectedImageIndex + 1} / {images.length}
                </motion.div>
              )}
            </motion.div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-3 overflow-x-auto pb-2"
              >
                {images.map((img, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex-shrink-0 w-20 h-20 rounded border-2 transition-all ${
                      selectedImageIndex === idx
                        ? "border-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={img.imageUrl}
                      alt={`Imagem ${idx + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* Controles de navegação */}
            {images.length > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex gap-4 mt-6"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePrevImage}
                  className="flex-1 py-3 border border-border hover:border-primary transition-colors flex items-center justify-center gap-2"
                >
                  <ChevronLeft size={20} />
                  Anterior
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNextImage}
                  className="flex-1 py-3 border border-border hover:border-primary transition-colors flex items-center justify-center gap-2"
                >
                  Próxima
                  <ChevronRight size={20} />
                </motion.button>
              </motion.div>
            )}
          </motion.div>

          {/* Informações do Veículo */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-1"
          >
            {/* Preço */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-3">
                Preço
              </p>
              <p className="text-4xl md:text-5xl font-bold text-foreground">
                {formatPrice(vehicle.price)}
              </p>
            </motion.div>

            {/* Especificações */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6 mb-8"
            >
              <div className="border-b border-border pb-4">
                <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-2">
                  Ano
                </p>
                <p className="text-lg font-light">{vehicle.year}</p>
              </div>

              <div className="border-b border-border pb-4">
                <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-2">
                  Quilometragem
                </p>
                <p className="text-lg font-light">
                  {vehicle.mileage?.toLocaleString("pt-BR") || "N/A"} KM
                </p>
              </div>

              <div className="border-b border-border pb-4">
                <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-2">
                  Categoria
                </p>
                <p className="text-lg font-light capitalize">{vehicle.category}</p>
              </div>

              <div className="border-b border-border pb-4">
                <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-2">
                  Cor
                </p>
                <p className="text-lg font-light">{vehicle.color || "Não informada"}</p>
              </div>

              <div className="border-b border-border pb-4">
                <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-2">
                  Transmissão
                </p>
                <p className="text-lg font-light capitalize">
                  {vehicle.transmission || "Não informada"}
                </p>
              </div>
            </motion.div>

            {/* Descrição */}
            {vehicle.description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-8"
              >
                <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-3">
                  Descrição
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed font-light">
                  {vehicle.description}
                </p>
              </motion.div>
            )}

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-3"
            >
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href={`https://wa.me/${storeSettings.phone?.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="premium-button w-full flex items-center justify-center gap-2 block text-center"
              >
                <MessageCircle size={18} />
                Consultar via WhatsApp
              </motion.a>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (canAddMore() || isVehicleSelected(vehicle.id)) {
                    addVehicle(vehicle as any);
                    if (isVehicleSelected(vehicle.id)) {
                      setLocation("/comparison");
                    }
                  }
                }}
                className={`w-full py-3 px-4 rounded border transition-all flex items-center justify-center gap-2 ${
                  isVehicleSelected(vehicle.id)
                    ? "bg-primary text-primary-foreground border-primary"
                    : canAddMore()
                    ? "border-primary text-primary hover:bg-primary/10"
                    : "border-border text-muted-foreground cursor-not-allowed opacity-50"
                }`}
                disabled={!canAddMore() && !isVehicleSelected(vehicle.id)}
              >
                <Scale size={18} />
                {isVehicleSelected(vehicle.id) ? "Comparando" : "Comparar"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setLocation("/")}
                className="w-full py-3 border border-border hover:border-primary transition-colors"
              >
                Voltar para Catálogo
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && currentImage?.imageUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.img
              src={currentImage.imageUrl}
              alt="Imagem ampliada"
              className="w-full h-auto rounded-lg"
            />

            {/* Close button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 p-2 rounded transition-colors"
            >
              <X size={24} className="text-white" />
            </motion.button>

            {/* Navigation */}
            {images.length > 1 && (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded transition-colors"
                >
                  <ChevronLeft size={24} className="text-white" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded transition-colors"
                >
                  <ChevronRight size={24} className="text-white" />
                </motion.button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}

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
