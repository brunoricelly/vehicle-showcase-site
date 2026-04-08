import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Trash2, Edit2, Plus } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"vehicles" | "history" | "webhooks">("vehicles");

  // Redirect if not admin
  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="neon-card text-center">
          <p className="text-primary text-lg mb-4">&gt; ACESSO NEGADO</p>
          <p className="text-muted-foreground mb-6">PRIVILÉGIOS DE ADMINISTRADOR NECESSÁRIOS</p>
          <Link href="/">
            <Button className="neon-button">VOLTAR PARA INÍCIO</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { data: vehicles, isLoading, refetch } = trpc.vehicles.list.useQuery({});
  const deleteVehicleMutation = trpc.vehicles.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja deletar este veículo?")) {
      deleteVehicleMutation.mutate({ id });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b-2 border-primary py-6 px-4">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold neon-glow">PAINEL ADMINISTRATIVO</h1>
            <Link href="/">
              <Button className="neon-button">← SAIR</Button>
            </Link>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-4 border-b-2 border-primary pb-4">
            <button
              onClick={() => setActiveTab("vehicles")}
              className={`px-4 py-2 font-bold transition-all ${
                activeTab === "vehicles"
                  ? "text-primary neon-glow border-b-2 border-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              &gt; VEÍCULOS
            </button>
            <Link href="/admin/history">
              <button
                className={`px-4 py-2 font-bold transition-all text-muted-foreground hover:text-primary`}
              >
                &gt; HISTÓRICO
              </button>
            </Link>
            <button
              onClick={() => setActiveTab("webhooks")}
              className={`px-4 py-2 font-bold transition-all ${
                activeTab === "webhooks"
                  ? "text-primary neon-glow border-b-2 border-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              &gt; WEBHOOKS
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="py-12 px-4">
        <div className="container">
          {activeTab === "vehicles" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-primary">&gt; GERENCIAMENTO DE VEÍCULOS</h2>
                <Link href="/admin/vehicle/new">
                  <Button className="neon-button flex items-center gap-2">
                    <Plus size={20} /> ADICIONAR VEÍCULO
                  </Button>
                </Link>
              </div>

              {isLoading ? (
                <p className="text-muted-foreground text-center py-12 animate-pulse">
                  &gt; CARREGANDO VEÍCULOS...
                </p>
              ) : vehicles && vehicles.length > 0 ? (
                <div className="space-y-4">
                  {vehicles.map((vehicle) => (
                    <Card key={vehicle.id} className="neon-card p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-primary">
                            {vehicle.brand.toUpperCase()} {vehicle.model.toUpperCase()}
                          </h3>
                          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                            <span>&gt; {vehicle.year}</span>
                            <span>&gt; {vehicle.category}</span>
                            <span>&gt; ${parseFloat(vehicle.price.toString()).toLocaleString()}</span>
                            {vehicle.mileage && <span>&gt; {vehicle.mileage} KM</span>}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Link href={`/admin/vehicle/${vehicle.id}`}>
                            <Button className="neon-button flex items-center gap-2">
                              <Edit2 size={18} /> EDITAR
                            </Button>
                          </Link>
                          <Button
                            onClick={() => handleDelete(vehicle.id)}
                            className="px-4 py-2 border-2 border-destructive text-destructive hover:bg-destructive hover:text-black transition-all"
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 neon-card">
                  <p className="text-muted-foreground text-lg">&gt; NENHUM VEÍCULO ENCONTRADO</p>
                  <Link href="/admin/vehicle/new">
                    <Button className="neon-button mt-4">CRIAR PRIMEIRO VEÍCULO</Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div>
              <h2 className="text-2xl font-bold text-primary mb-6">&gt; HISTÓRICO DE ALTERAÇÕES</h2>
              <div className="text-center py-12 neon-card">
                <p className="text-muted-foreground">History view coming soon...</p>
              </div>
            </div>
          )}

          {activeTab === "webhooks" && (
            <div>
              <h2 className="text-2xl font-bold text-secondary mb-6">&gt; WEBHOOK LOGS</h2>
              <div className="text-center py-12 neon-card">
                <p className="text-muted-foreground">Webhook logs view coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
