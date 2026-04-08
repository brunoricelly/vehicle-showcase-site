import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getLoginUrl } from "@/const";
import { Menu, Search, MessageCircle } from "lucide-react";

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
      <header className="bg-card border-b border-border py-4 sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">exchange</h1>
              <span className="text-xs text-muted-foreground">motors</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Menu
              </button>
              <a href="https://wa.me/5519999999999" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                ℹ 3826-2818
              </a>
              <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Encontrar veículo
              </button>
              <Search size={20} className="text-muted-foreground cursor-pointer" />
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden flex items-center gap-4">
              <Search size={20} className="text-muted-foreground cursor-pointer" />
              <button onClick={() => setMenuOpen(!menuOpen)} className="text-muted-foreground">
                <Menu size={24} />
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {menuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-border pt-4 space-y-3">
              <button className="block w-full text-left text-sm text-muted-foreground hover:text-foreground transition-colors">
                Menu
              </button>
              <a href="https://wa.me/5519999999999" target="_blank" rel="noopener noreferrer" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                ℹ 3826-2818
              </a>
              <button className="block w-full text-left text-sm text-muted-foreground hover:text-foreground transition-colors">
                Encontrar veículo
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Search Bar */}
      <section className="bg-card border-b border-border py-6">
        <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Input
              type="text"
              placeholder="Marca, modelo..."
              value={searchBrand}
              onChange={(e) => setSearchBrand(e.target.value)}
              className="premium-input col-span-1 md:col-span-2 lg:col-span-2"
            />

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="premium-input"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value} className="bg-card text-foreground">
                  {cat.label}
                </option>
              ))}
            </select>

            <Input
              type="number"
              placeholder="Preço mín."
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="premium-input"
            />

            <Input
              type="number"
              placeholder="Preço máx."
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="premium-input"
            />
          </div>
        </div>
      </section>

      {/* Vehicles Grid */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground animate-pulse">Carregando veículos...</p>
            </div>
          ) : vehicles && vehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {vehicles.map((vehicle) => (
                <Card
                  key={vehicle.id}
                  onClick={() => handleVehicleClick(vehicle.id)}
                  className="premium-card cursor-pointer overflow-hidden"
                >
                  {/* Imagem Grande */}
                  <div className="w-full h-64 md:h-72 bg-muted overflow-hidden flex items-center justify-center text-muted-foreground">
                    &gt; IMAGEM DO VEÍCULO
                  </div>

                  {/* Conteúdo */}
                  <div className="p-6 bg-card">
                    {/* Marca */}
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-2">
                      {vehicle.brand}
                    </p>

                    {/* Modelo */}
                    <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4">
                      {vehicle.model}
                    </h3>

                    {/* Linha divisória */}
                    <div className="w-12 h-0.5 bg-primary mb-4"></div>

                    {/* Especificações */}
                    <div className="flex justify-between text-xs md:text-sm text-primary mb-4">
                      <span>{vehicle.year}/{vehicle.year}</span>
                      <span>{vehicle.mileage?.toLocaleString("pt-BR") || "N/A"} KM</span>
                    </div>

                    {/* Preço */}
                    <p className="text-2xl md:text-3xl font-bold text-foreground">
                      R$ {formatPrice(typeof vehicle.price === 'string' ? parseFloat(vehicle.price) : vehicle.price).replace("R$ ", "")}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card p-8">
              <p className="text-muted-foreground text-lg">Nenhum veículo encontrado</p>
              <p className="text-muted-foreground mt-2 text-sm">Tente ajustar seus filtros</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 md:py-12">
        <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 md:mb-12">
            {/* Localização */}
            <div>
              <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-4">
                Localização
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Avenida Salvador Rotella, 488<br />
                Jardim Flora, Vinhedo - SP<br />
                CEP 13280-156
              </p>
            </div>

            {/* Horário */}
            <div>
              <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-4">
                Horário
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Segunda a Sexta: 09h00 às 18h<br />
                Sábado: 09h00 às 13h<br />
                Domingo: Fechado
              </p>
            </div>

            {/* Contato */}
            <div>
              <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-4">
                Contato
              </p>
              <div className="space-y-2">
                <a
                  href="https://wa.me/5519999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors block"
                >
                  WhatsApp: (19) 9999-9999
                </a>
                <a
                  href="https://instagram.com/vehicleshowcase"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors block"
                >
                  Instagram: @vehicleshowcase
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6 md:pt-8 text-center">
            <p className="text-xs text-muted-foreground">
              &copy; 2026 Vehicle Showcase. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/5519999999999"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 md:w-16 md:h-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 z-40"
      >
        <MessageCircle size={24} />
      </a>
    </div>
  );
}
