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
          <p className="text-secondary text-lg mb-4">&gt; ACCESS DENIED</p>
          <p className="text-muted-foreground mb-6">ADMIN PRIVILEGES REQUIRED</p>
          <Link href="/">
            <Button className="neon-button">RETURN HOME</Button>
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
    if (confirm("Are you sure you want to delete this vehicle?")) {
      deleteVehicleMutation.mutate({ id });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b-2 border-secondary py-6 px-4">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold neon-glow">ADMIN PANEL</h1>
            <Link href="/">
              <Button className="neon-button">← EXIT ADMIN</Button>
            </Link>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-4 border-b-2 border-secondary pb-4">
            <button
              onClick={() => setActiveTab("vehicles")}
              className={`px-4 py-2 font-bold transition-all ${
                activeTab === "vehicles"
                  ? "text-primary neon-glow border-b-2 border-primary"
                  : "text-muted-foreground hover:text-secondary"
              }`}
            >
              &gt; VEHICLES
            </button>
            <Link href="/admin/history">
              <button
                className={`px-4 py-2 font-bold transition-all text-muted-foreground hover:text-secondary`}
              >
                &gt; HISTORY
              </button>
            </Link>
            <button
              onClick={() => setActiveTab("webhooks")}
              className={`px-4 py-2 font-bold transition-all ${
                activeTab === "webhooks"
                  ? "text-primary neon-glow border-b-2 border-primary"
                  : "text-muted-foreground hover:text-secondary"
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
                <h2 className="text-2xl font-bold text-secondary">&gt; VEHICLE MANAGEMENT</h2>
                <Link href="/admin/vehicle/new">
                  <Button className="neon-button flex items-center gap-2">
                    <Plus size={20} /> ADD VEHICLE
                  </Button>
                </Link>
              </div>

              {isLoading ? (
                <p className="text-secondary text-center py-12 animate-pulse">
                  &gt; LOADING VEHICLES...
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
                              <Edit2 size={18} /> EDIT
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
                  <p className="text-secondary text-lg">&gt; NO VEHICLES FOUND</p>
                  <Link href="/admin/vehicle/new">
                    <Button className="neon-button mt-4">CREATE FIRST VEHICLE</Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div>
              <h2 className="text-2xl font-bold text-secondary mb-6">&gt; CHANGE HISTORY</h2>
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
