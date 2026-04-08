import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Settings, Package, LogOut, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type TabType = "settings" | "inventory";

export default function AdminPanel() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>("settings");
  const [loading, setLoading] = useState(false);

  // Store Settings
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [businessHours, setBusinessHours] = useState("");

  // Queries
  const { data: storeSettings } = trpc.store.settings.useQuery();
  const { data: vehicles } = trpc.vehicles.list.useQuery({});
  const { mutate: updateSettings } = trpc.store.updateSettings.useMutation({
    onSuccess: () => {
      toast.success("Configurações atualizadas com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });
  const { mutate: logout } = trpc.auth.logout.useMutation({
    onSuccess: () => {
      setLocation("/");
    },
  });
  const { mutate: deleteVehicle } = trpc.vehicles.delete.useMutation({
    onSuccess: () => {
      toast.success("Veículo deletado com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao deletar: ${error.message}`);
    },
  });

  // Load store settings when data arrives (useEffect)
  useEffect(() => {
    if (storeSettings) {
      setStoreName(storeSettings.storeName || "");
      setStoreDescription(storeSettings.storeDescription || "");
      setAddress(storeSettings.address || "");
      setCity(storeSettings.city || "");
      setState(storeSettings.state || "");
      setZipCode(storeSettings.zipCode || "");
      setPhone(storeSettings.phone || "");
      setEmail(storeSettings.email || "");
      setWebsite(storeSettings.website || "");
      setBusinessHours(storeSettings.businessHours || "");
    }
  }, [storeSettings]);

  // Check if user is admin and email is authorized
  const { data: isEmailAuthorized, isLoading: isCheckingAuth } = trpc.admin.isEmailAuthorized.useQuery(
    { email: user?.email || "" },
    { enabled: !!user?.email }
  );

  if (user?.role !== "admin" || (isEmailAuthorized === false && !isCheckingAuth)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Acesso Negado</h1>
          <p className="text-muted-foreground mb-6">
            {user?.role !== "admin" 
              ? "Você não tem permissão para acessar esta página."
              : "Seu email não está autorizado para acessar o painel administrativo."}
          </p>
          <Button onClick={() => setLocation("/")} variant="default">
            Voltar para Home
          </Button>
        </Card>
      </div>
    );
  }

  const handleSaveSettings = () => {
    setLoading(true);
    updateSettings(
      {
        storeName,
        storeDescription,
        address,
        city,
        state,
        zipCode,
        phone,
        email,
        website,
        businessHours,
      },
      {
        onSettled: () => setLoading(false),
      }
    );
  };

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
            <div className="flex items-center gap-4">
              <button
                onClick={() => setLocation("/")}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <h1 className="text-2xl font-bold">Painel Administrativo</h1>
            </div>
            <button
              onClick={() => logout()}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
        </div>
      </motion.header>

      <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border pb-4">
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === "settings"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Settings size={20} />
            Configurações
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === "inventory"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Package size={20} />
            Estoque ({vehicles?.length || 0})
          </button>
        </div>

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-8">
              <h2 className="text-xl font-bold mb-6">Configurações da Loja</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Store Name */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Nome da Loja
                  </label>
                  <Input
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Ex: Exchange Motors"
                    className="bg-muted border-border"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Telefone
                  </label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: (19) 3826-2818"
                    className="bg-muted border-border"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ex: contato@exchangemotors.com"
                    className="bg-muted border-border"
                  />
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Website
                  </label>
                  <Input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="Ex: www.exchangemotors.com"
                    className="bg-muted border-border"
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Endereço
                  </label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ex: Rua Principal, 123"
                    className="bg-muted border-border"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Cidade
                  </label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ex: São Paulo"
                    className="bg-muted border-border"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Estado
                  </label>
                  <Input
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Ex: SP"
                    maxLength={2}
                    className="bg-muted border-border"
                  />
                </div>

                {/* Zip Code */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    CEP
                  </label>
                  <Input
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="Ex: 01310-100"
                    className="bg-muted border-border"
                  />
                </div>

                {/* Business Hours */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Horário de Funcionamento
                  </label>
                  <Input
                    value={businessHours}
                    onChange={(e) => setBusinessHours(e.target.value)}
                    placeholder="Ex: Seg-Sex: 09:00-18:00"
                    className="bg-muted border-border"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={storeDescription}
                    onChange={(e) => setStoreDescription(e.target.value)}
                    placeholder="Descrição da sua loja..."
                    rows={4}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <Button
                  onClick={handleSaveSettings}
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90"
                >
                  {loading ? "Salvando..." : "Salvar Configurações"}
                </Button>
                <Button
                  onClick={() => setLocation("/")}
                  variant="outline"
                >
                  Cancelar
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Inventory Tab */}
        {activeTab === "inventory" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Gerenciar Estoque</h2>
                <Button
                  onClick={() => setLocation("/admin/vehicle/new")}
                  className="bg-primary hover:bg-primary/90"
                >
                  + Adicionar Veículo
                </Button>
              </div>

              {vehicles && vehicles.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border">
                      <tr className="text-muted-foreground">
                        <th className="text-left py-3 px-4">Marca/Modelo</th>
                        <th className="text-left py-3 px-4">Ano</th>
                        <th className="text-left py-3 px-4">KM</th>
                        <th className="text-left py-3 px-4">Preço</th>
                        <th className="text-left py-3 px-4">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicles.map((vehicle) => (
                        <tr key={vehicle.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-medium">{vehicle.brand} {vehicle.model}</div>
                            <div className="text-xs text-muted-foreground">{vehicle.category}</div>
                          </td>
                          <td className="py-3 px-4">{vehicle.year}</td>
                          <td className="py-3 px-4">{vehicle.mileage ? (vehicle.mileage as number).toLocaleString() : '0'} km</td>
                          <td className="py-3 px-4">
                            {vehicle.price ? new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(Number(vehicle.price)) : 'R$ 0,00'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button
                                onClick={() => setLocation(`/admin/vehicle/${vehicle.id}`)}
                                size="sm"
                                variant="outline"
                              >
                                Editar
                              </Button>
                              <Button
                                onClick={() => {
                                  if (confirm(`Deseja deletar ${vehicle.brand} ${vehicle.model}?`)) {
                                    deleteVehicle({ id: vehicle.id });
                                  }
                                }}
                                size="sm"
                                variant="outline"
                                className="text-red-500 hover:text-red-600"
                              >
                                Deletar
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">Nenhum veículo cadastrado</p>
                  <Button
                    onClick={() => setLocation("/admin/vehicle/new")}
                    className="bg-primary hover:bg-primary/90"
                  >
                    + Adicionar Primeiro Veículo
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
