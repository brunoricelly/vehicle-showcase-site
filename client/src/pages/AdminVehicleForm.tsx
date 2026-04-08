import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function AdminVehicleForm() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { id } = useParams<{ id: string }>();
  const isNewVehicle = id === "new";
  const vehicleId = isNewVehicle ? 0 : parseInt(id || "0", 10);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    category: "sedan",
    price: "",
    mileage: "",
    color: "",
    transmission: "automatic",
    fuelType: "gasoline",
  });

  const { data: vehicle, isLoading } = trpc.vehicles.getById.useQuery(
    { id: vehicleId },
    { enabled: !isNewVehicle && vehicleId > 0 }
  );

  useEffect(() => {
    if (vehicle && !isNewVehicle) {
      setFormData({
        title: vehicle.title || "",
        description: vehicle.description || "",
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        category: vehicle.category,
        price: vehicle.price.toString(),
        mileage: vehicle.mileage?.toString() || "",
        color: vehicle.color || "",
        transmission: vehicle.transmission || "automatic",
        fuelType: vehicle.fuelType || "gasoline",
      });
    }
  }, [vehicle, isNewVehicle]);

  const createMutation = trpc.vehicles.create.useMutation({
    onSuccess: () => {
      setLocation("/admin");
    },
  });

  const updateMutation = trpc.vehicles.update.useMutation({
    onSuccess: () => {
      setLocation("/admin");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "year" || name === "mileage" ? (value ? parseInt(value) : "") : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isNewVehicle) {
      createMutation.mutate({
        ...formData,
        price: formData.price,
        mileage: formData.mileage ? parseInt(formData.mileage) : undefined,
      });
    } else {
      updateMutation.mutate({
        id: vehicleId,
        ...formData,
        price: formData.price,
        mileage: formData.mileage ? parseInt(formData.mileage) : undefined,
      });
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="neon-card text-center">
          <p className="text-secondary text-lg">&gt; ACCESS DENIED</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-secondary animate-pulse">&gt; LOADING...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b-2 border-secondary py-6 px-4">
        <div className="container">
          <h1 className="text-3xl font-bold neon-glow">
            {isNewVehicle ? "ADD NEW VEHICLE" : "EDIT VEHICLE"}
          </h1>
        </div>
      </header>

      <section className="py-12 px-4">
        <div className="container max-w-2xl">
          <Card className="neon-card">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-secondary block mb-2">&gt; TITLE</label>
                  <Input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="neon-input"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm text-secondary block mb-2">&gt; BRAND</label>
                  <Input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="neon-input"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm text-secondary block mb-2">&gt; MODEL</label>
                  <Input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    className="neon-input"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm text-secondary block mb-2">&gt; YEAR</label>
                  <Input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="neon-input"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm text-secondary block mb-2">&gt; CATEGORY</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="neon-input w-full">
                    <option value="sedan">SEDAN</option>
                    <option value="suv">SUV</option>
                    <option value="sports">SPORTS</option>
                    <option value="truck">TRUCK</option>
                    <option value="van">VAN</option>
                    <option value="hatchback">HATCHBACK</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-secondary block mb-2">&gt; PRICE</label>
                  <Input
                    type="number"
                    name="price"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    className="neon-input"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm text-secondary block mb-2">&gt; MILEAGE (KM)</label>
                  <Input
                    type="number"
                    name="mileage"
                    value={formData.mileage}
                    onChange={handleChange}
                    className="neon-input"
                  />
                </div>

                <div>
                  <label className="text-sm text-secondary block mb-2">&gt; COLOR</label>
                  <Input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="neon-input"
                  />
                </div>

                <div>
                  <label className="text-sm text-secondary block mb-2">&gt; TRANSMISSION</label>
                  <select name="transmission" value={formData.transmission} onChange={handleChange} className="neon-input w-full">
                    <option value="manual">MANUAL</option>
                    <option value="automatic">AUTOMATIC</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-secondary block mb-2">&gt; FUEL TYPE</label>
                  <select name="fuelType" value={formData.fuelType} onChange={handleChange} className="neon-input w-full">
                    <option value="gasoline">GASOLINE</option>
                    <option value="diesel">DIESEL</option>
                    <option value="electric">ELECTRIC</option>
                    <option value="hybrid">HYBRID</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-secondary block mb-2">&gt; DESCRIPTION</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="neon-input w-full h-32 p-3"
                  placeholder="Enter vehicle description..."
                />
              </div>

              <div className="flex gap-4 flex-wrap">
                <Button type="submit" className="neon-button flex-1">
                  {isNewVehicle ? "CREATE VEHICLE" : "UPDATE VEHICLE"}
                </Button>
                {!isNewVehicle && (
                  <Button
                    type="button"
                    onClick={() => setLocation(`/admin/vehicle/${vehicleId}/images`)}
                    className="px-6 py-2 border-2 border-secondary text-secondary hover:bg-secondary hover:text-black transition-all"
                  >
                    MANAGE IMAGES
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={() => setLocation("/admin")}
                  className="px-6 py-2 border-2 border-secondary text-secondary hover:bg-secondary hover:text-black transition-all"
                >
                  CANCEL
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </section>
    </div>
  );
}
