import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getLoginUrl } from "@/const";
import { Menu, Search, MessageCircle, ChevronDown } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
      duration: 0.5,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
  hover: {
    y: -12,
    transition: { duration: 0.3 },
  },
};

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchBrand, setSearchBrand] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: vehicles, isLoading } = trpc.vehicles.list.useQuery({
    search: searchBrand || undefined,
    category: selectedCategory || undefined,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
  });

  const handleVehicleClick = (id: number) => {
    setLocation(`/vehicle/${id}`);
  };

  const handleAdminClick = () => {
    if (user?.role === "admin") {
      setLocation("/admin");
    } else {
      window.location.href = getLoginUrl();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const categories = [
    { value: "", label: "TODAS" },
    { value: "sedan", label: "SEDAN" },
    { value: "suv", label: "SUV" },
    { value: "sports", label: "ESPORTIVO" },
    { value: "truck", label: "CAMINHONETE" },
    { value: "van", label: "VAN" },
    { value: "hatchback", label: "HATCHBACK" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card border-b border-border py-4 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95"
      >
        <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                exchange
              </h1>
              <span className="text-xs text-muted-foreground font-light tracking-widest">
                motors
              </span>
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <motion.button
                whileHover={{ color: "var(--primary)" }}
                className="text-sm text-muted-foreground transition-colors"
              >
                Menu
              </motion.button>
              <motion.a
                whileHover={{ color: "var(--primary)" }}
                href="https://wa.me/5519999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground transition-colors"
              >
                ℹ 3826-2818
              </motion.a>
              <motion.button
                whileHover={{ color: "var(--primary)" }}
                className="text-sm text-muted-foreground transition-colors"
              >
                Encontrar veículo
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Search size={20} />
              </motion.button>
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden flex items-center gap-4">
              <Search size={20} className="text-muted-foreground cursor-pointer" />
              <motion.button
                onClick={() => setMenuOpen(!menuOpen)}
                whileHover={{ scale: 1.1 }}
                className="text-muted-foreground"
              >
                <Menu size={24} />
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: menuOpen ? 1 : 0, height: menuOpen ? "auto" : 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden mt-4 pb-4 border-t border-border pt-4 space-y-3 overflow-hidden"
          >
            <button className="block w-full text-left text-sm text-muted-foreground hover:text-primary transition-colors">
              Menu
            </button>
            <a
              href="https://wa.me/5519999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              ℹ 3826-2818
            </a>
            <button className="block w-full text-left text-sm text-muted-foreground hover:text-primary transition-colors">
              Encontrar veículo
            </button>
          </motion.div>
        </div>
      </motion.header>

      {/* Search Bar */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-card border-b border-border py-6 md:py-8"
      >
        <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <Input
                type="text"
                placeholder="Marca, modelo..."
                value={searchBrand}
                onChange={(e) => setSearchBrand(e.target.value)}
                className="premium-input col-span-1 md:col-span-2 lg:col-span-2"
              />
            </motion.div>

            <motion.select
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="premium-input"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value} className="bg-card text-foreground">
                  {cat.label}
                </option>
              ))}
            </motion.select>

            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <Input
                type="number"
                placeholder="Preço mín."
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="premium-input"
              />
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <Input
                type="number"
                placeholder="Preço máx."
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="premium-input"
              />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Vehicles Grid */}
      <section className="py-16 md:py-24 lg:py-32">
        <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-muted-foreground"
              >
                Carregando veículos premium...
              </motion.p>
            </motion.div>
          ) : vehicles && vehicles.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
            >
              {vehicles.map((vehicle) => (
                <motion.div
                  key={vehicle.id}
                  variants={cardVariants}
                  whileHover="hover"
                  onClick={() => handleVehicleClick(vehicle.id)}
                  className="cursor-pointer"
                >
                  <Card className="premium-card overflow-hidden">
                    {/* Imagem Grande */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.4 }}
                      className="w-full h-72 md:h-80 bg-muted overflow-hidden flex items-center justify-center text-muted-foreground relative group"
                    >
                      {vehicle.images && vehicle.images.length > 0 && vehicle.images[0]?.imageUrl ? (
                        <motion.img
                          src={vehicle.images[0].imageUrl}
                          alt={`${vehicle.brand} ${vehicle.model}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          &gt; IMAGEM DO VEÍCULO
                        </motion.div>
                      )}
                    </motion.div>

                    {/* Conteúdo */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="p-8 md:p-10 bg-card"
                    >
                      {/* Marca */}
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15 }}
                        className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-3"
                      >
                        {vehicle.brand}
                      </motion.p>

                      {/* Modelo */}
                      <motion.h3
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl md:text-3xl font-bold text-foreground mb-6 tracking-tight"
                      >
                        {vehicle.model}
                      </motion.h3>

                      {/* Linha divisória */}
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: 48 }}
                        transition={{ delay: 0.25, duration: 0.6 }}
                        className="h-0.5 bg-primary mb-6"
                      ></motion.div>

                      {/* Especificações */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex justify-between text-xs md:text-sm text-primary mb-6 font-light tracking-wide"
                      >
                        <span>{vehicle.year}/{vehicle.year}</span>
                        <span>{vehicle.mileage?.toLocaleString("pt-BR") || "N/A"} KM</span>
                      </motion.div>

                      {/* Preço */}
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.35 }}
                        className="text-3xl md:text-4xl font-bold text-foreground tracking-tight"
                      >
                        R$ {formatPrice(typeof vehicle.price === 'string' ? parseFloat(vehicle.price) : vehicle.price).replace("R$ ", "")}
                      </motion.p>
                    </motion.div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-card p-12"
            >
              <p className="text-muted-foreground text-lg mb-2">Nenhum veículo encontrado</p>
              <p className="text-muted-foreground text-sm">Tente ajustar seus filtros</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-card border-t border-border py-12 md:py-16 lg:py-20"
      >
        <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 mb-12 md:mb-16">
            {/* Localização */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-6">
                Localização
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed font-light">
                Avenida Salvador Rotella, 488<br />
                Jardim Flora, Vinhedo - SP<br />
                CEP 13280-156
              </p>
            </motion.div>

            {/* Horário */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-6">
                Horário
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed font-light">
                Segunda a Sexta: 09h00 às 18h<br />
                Sábado: 09h00 às 13h<br />
                Domingo: Fechado
              </p>
            </motion.div>

            {/* Contato */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-6">
                Contato
              </p>
              <div className="space-y-3">
                <motion.a
                  whileHover={{ x: 4 }}
                  href="https://wa.me/5519999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors block font-light"
                >
                  WhatsApp: (19) 9999-9999
                </motion.a>
                <motion.a
                  whileHover={{ x: 4 }}
                  href="https://instagram.com/vehicleshowcase"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors block font-light"
                >
                  Instagram: @vehicleshowcase
                </motion.a>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="border-t border-border pt-8 md:pt-12 text-center origin-left"
          >
            <p className="text-xs text-muted-foreground font-light tracking-wide">
              &copy; 2026 Vehicle Showcase. Todos os direitos reservados.
            </p>
          </motion.div>
        </div>
      </motion.footer>

      {/* WhatsApp Floating Button */}
      <motion.a
        href="https://wa.me/5519999999999"
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
