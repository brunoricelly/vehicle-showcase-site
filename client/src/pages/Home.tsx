import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { MessageCircle } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    minPrice: "",
    maxPrice: "",
  });

  const { data: vehicles, isLoading } = trpc.vehicles.list.useQuery({
    search: filters.search || undefined,
    category: filters.category || undefined,
    minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

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
    { value: "", label: "TODAS AS CATEGORIAS" },
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
      <header className="border-b-2 border-primary py-4 md:py-6 sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold neon-glow">VEHICLE SHOWCASE</h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">[EDIÇÃO PREMIUM]</p>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
              <a href="https://wa.me/5519999999999" target="_blank" rel="noopener noreferrer" className="text-sm md:text-base text-primary hover:text-accent transition-colors font-semibold">
                (19) 9999-9999
              </a>
              <Button onClick={handleAdminClick} className="neon-button text-xs md:text-sm px-3 md:px-6">
                ADMIN
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 lg:py-32 border-b-2 border-primary">
        <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 neon-glow leading-tight">
              Seu próximo sonho começa aqui
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-4 md:mb-6">
              Descubra o carro que vai marcar sua história
            </p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Nosso estoque é formado por veículos selecionados com olhar criterioso, procedência garantida e alto padrão em cada detalhe.
            </p>
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="py-8 md:py-12 border-b-2 border-primary bg-card">
        <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Search */}
            <div>
              <label className="text-xs md:text-sm text-primary font-semibold block mb-2 uppercase tracking-wider">
                &gt; Buscar
              </label>
              <Input
                type="text"
                name="search"
                placeholder="Marca, modelo..."
                value={filters.search}
                onChange={handleFilterChange}
                className="neon-input text-sm"
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-xs md:text-sm text-primary font-semibold block mb-2 uppercase tracking-wider">
                &gt; Categoria
              </label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="neon-input text-sm w-full bg-input text-foreground"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value} className="bg-card text-foreground">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Price */}
            <div>
              <label className="text-xs md:text-sm text-primary font-semibold block mb-2 uppercase tracking-wider">
                &gt; Preço Mín.
              </label>
              <Input
                type="number"
                name="minPrice"
                placeholder="0"
                value={filters.minPrice}
                onChange={handleFilterChange}
                className="neon-input text-sm"
              />
            </div>

            {/* Max Price */}
            <div>
              <label className="text-xs md:text-sm text-primary font-semibold block mb-2 uppercase tracking-wider">
                &gt; Preço Máx.
              </label>
              <Input
                type="number"
                name="maxPrice"
                placeholder="999999"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                className="neon-input text-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Veículos Grid */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground animate-pulse">&gt; CARREGANDO...</p>
            </div>
          ) : vehicles && vehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {vehicles.map((vehicle) => (
                <Card
                  key={vehicle.id}
                  onClick={() => handleVehicleClick(vehicle.id)}
                  className="neon-card cursor-pointer group overflow-hidden transition-all duration-300 hover:shadow-2xl"
                >
                  {/* Imagem */}
                  <div className="w-full h-48 md:h-56 bg-muted overflow-hidden border-b-2 border-primary">
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground group-hover:scale-105 transition-transform duration-300 text-sm md:text-base">
                      &gt; IMAGEM DO VEÍCULO
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="p-4 md:p-6">
                    {/* Marca */}
                    <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-widest font-semibold">
                      {vehicle.brand}
                    </p>

                    {/* Modelo */}
                    <h3 className="text-xl md:text-2xl font-bold text-foreground mt-2 mb-4">
                      {vehicle.model}
                    </h3>

                    {/* Especificações */}
                    <div className="flex justify-between text-xs md:text-sm text-muted-foreground py-3 md:py-4 border-t border-primary/20">
                      <span>{vehicle.year}/{vehicle.year}</span>
                      <span>{vehicle.mileage?.toLocaleString("pt-BR") || "N/A"} KM</span>
                    </div>

                    {/* Preço */}
                    <p className="text-2xl md:text-3xl font-bold text-primary mt-4 neon-glow">
                      {formatPrice(typeof vehicle.price === 'string' ? parseFloat(vehicle.price) : vehicle.price)}
                    </p>

                    {/* Botão */}
                    <Button
                      onClick={() => handleVehicleClick(vehicle.id)}
                      className="w-full mt-4 neon-button text-sm"
                    >
                      VER DETALHES
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 neon-card">
              <p className="text-muted-foreground text-lg">&gt; NENHUM VEÍCULO ENCONTRADO</p>
              <p className="text-muted-foreground mt-2 text-sm">TENTE AJUSTAR SEUS FILTROS</p>
            </div>
          )}
        </div>
      </section>

      {/* Sobre */}
      <section className="py-12 md:py-16 lg:py-20 border-t-2 border-primary bg-card">
        <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider mb-2 md:mb-4">
                &gt; QUEM SOMOS
              </p>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6">
                Experiência, estrutura e confiança em cada entrega
              </h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-4 md:mb-6">
                O que começou com intermediação em um pequeno escritório evoluiu para uma empresa de excelência com mais de 1.000m² de showroom e um portfólio que reúne veículos de alto padrão, preparados com qualidade.
              </p>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Cada veículo é selecionado com critério, procedência garantida e alto padrão em cada detalhe.
              </p>
            </div>

            <div className="neon-card text-center py-8 md:py-12">
              <p className="text-sm md:text-base text-muted-foreground mb-4">Fale conosco pelo WhatsApp</p>
              <a
                href="https://wa.me/5519999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-green-500 text-black font-bold rounded-lg hover:bg-green-600 transition-colors text-sm md:text-base"
              >
                <MessageCircle size={20} />
                INICIAR CONVERSA
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-primary py-8 md:py-12 bg-background">
        <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 md:mb-12">
            {/* Localização */}
            <div>
              <p className="text-xs md:text-sm text-primary font-semibold uppercase tracking-wider mb-2 md:mb-4">
                &gt; LOCALIZAÇÃO
              </p>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Avenida Salvador Rotella, 488<br />
                Jardim Flora, Vinhedo - SP<br />
                CEP 13280-156
              </p>
            </div>

            {/* Horário */}
            <div>
              <p className="text-xs md:text-sm text-primary font-semibold uppercase tracking-wider mb-2 md:mb-4">
                &gt; HORÁRIO
              </p>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Segunda a Sexta: 09h00 às 18h<br />
                Sábado: 09h00 às 13h<br />
                Domingo: Fechado
              </p>
            </div>

            {/* Contato */}
            <div>
              <p className="text-xs md:text-sm text-primary font-semibold uppercase tracking-wider mb-2 md:mb-4">
                &gt; CONTATO
              </p>
              <div className="space-y-2">
                <a
                  href="https://wa.me/5519999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm md:text-base text-muted-foreground hover:text-primary transition-colors block"
                >
                  WhatsApp: (19) 9999-9999
                </a>
                <a
                  href="https://instagram.com/vehicleshowcase"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm md:text-base text-muted-foreground hover:text-primary transition-colors block"
                >
                  Instagram: @vehicleshowcase
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-primary/20 pt-6 md:pt-8 text-center">
            <p className="text-xs md:text-sm text-muted-foreground">
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
