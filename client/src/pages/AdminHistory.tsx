import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function AdminHistory() {
  const { user } = useAuth();
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);

  // Hooks MUST be called before any early returns
  const { data: vehicles } = trpc.vehicles.list.useQuery({});
  const { data: history, isLoading } = trpc.vehicleHistory.getByVehicleId.useQuery(
    { vehicleId: selectedVehicleId || 0 },
    { enabled: selectedVehicleId !== null }
  );

  // Redirect if not admin
  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="neon-card text-center">
          <p className="text-primary text-lg mb-4">&gt; ACESSO NEGADO</p>
          <Link href="/">
            <Button className="neon-button">VOLTAR PARA INÍCIO</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "created":
        return "text-accent";
      case "updated":
        return "text-secondary";
      case "deleted":
        return "text-destructive";
      default:
        return "text-foreground";
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "created":
        return "[CREATED]";
      case "updated":
        return "[UPDATED]";
      case "deleted":
        return "[DELETED]";
      default:
        return `[${action.toUpperCase()}]`;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b-2 border-primary py-6 px-4">
        <div className="container">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold neon-glow">HISTÓRICO DE ALTERAÇÕES</h1>
            <Link href="/admin">
              <Button className="neon-button">← VOLTAR PARA ADMIN</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="py-12 px-4">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Vehicle Selector */}
            <div className="lg:col-span-1">
              <Card className="neon-card sticky top-4">
                <h2 className="text-lg font-bold text-primary mb-4">&gt; SELECIONAR VEÍCULO</h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {vehicles && vehicles.length > 0 ? (
                    vehicles.map((vehicle) => (
                      <button
                        key={vehicle.id}
                        onClick={() => setSelectedVehicleId(vehicle.id)}
                        className={`w-full text-left px-3 py-2 border-2 transition-all ${
                          selectedVehicleId === vehicle.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-secondary text-foreground hover:border-primary"
                        }`}
                      >
                        <p className="font-bold text-sm">
                          {vehicle.brand} {vehicle.model}
                        </p>
                        <p className="text-xs text-muted-foreground">{vehicle.year}</p>
                      </button>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">&gt; NENHUM VEÍCULO</p>
                  )}
                </div>
              </Card>
            </div>

            {/* History Timeline */}
            <div className="lg:col-span-3">
              {selectedVehicleId === null ? (
                <Card className="neon-card text-center py-12">
                  <p className="text-muted-foreground text-lg">&gt; SELECIONE UM VEÍCULO PARA VER O HISTÓRICO</p>
                </Card>
              ) : isLoading ? (
                <Card className="neon-card text-center py-12">
                  <p className="text-muted-foreground animate-pulse">&gt; CARREGANDO HISTÓRICO...</p>
                </Card>
              ) : history && history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((entry, index) => (
                    <Card key={entry.id} className="neon-card p-4">
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 bg-secondary rounded-full"></div>
                          {index < history.length - 1 && (
                            <div className="w-0.5 h-12 bg-secondary mt-2"></div>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`font-bold ${getActionColor(entry.action)}`}>
                              {getActionLabel(entry.action)}
                            </span>
                            <span className="text-muted-foreground text-sm">
                              {entry.changedByName || "System"}
                            </span>
                          </div>

                          <p className="text-sm text-muted-foreground mb-2">
                            {entry.description}
                          </p>

                          {entry.changes ? (
                            <div className="bg-muted p-2 rounded text-xs text-foreground mb-2 max-h-24 overflow-y-auto">
                              <p className="text-primary mb-1">&gt; ALTERAÇÕES:</p>
                              <pre className="font-mono text-xs whitespace-pre-wrap break-words">
                                {typeof entry.changes === "string" ? entry.changes : JSON.stringify(entry.changes)}
                              </pre>
                            </div>
                          ) : null}

                          <p className="text-xs text-muted-foreground">
                            {new Date(entry.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="neon-card text-center py-12">
                  <p className="text-muted-foreground text-lg">&gt; NENHUM HISTÓRICO ENCONTRADO</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
