import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const vehicleId = parseInt(id || "0", 10);

  const { data: vehicle, isLoading, error } = trpc.vehicles.getById.useQuery(
    { id: vehicleId },
    { enabled: vehicleId > 0 }
  );

  const { data: images } = trpc.vehicleImages.getByVehicleId.useQuery(
    { vehicleId },
    { enabled: vehicleId > 0 }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-secondary animate-pulse">&gt; LOADING VEHICLE DATA...</p>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container py-12">
          <div className="text-center neon-card">
            <p className="text-secondary text-lg">&gt; VEHICLE NOT FOUND</p>
            <Link href="/">
              <Button className="neon-button mt-4">RETURN TO SHOWCASE</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const mainImage = images?.find((img) => img.isMainImage) || images?.[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b-2 border-secondary py-6 px-4">
        <div className="container">
          <Link href="/">
            <Button className="neon-button mb-4">← BACK TO SHOWCASE</Button>
          </Link>
          <h1 className="text-3xl font-bold neon-glow">
            {vehicle.brand.toUpperCase()} {vehicle.model.toUpperCase()}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Image Gallery */}
            <div className="lg:col-span-2">
              <div className="neon-card mb-6">
                <div className="bg-muted h-96 flex items-center justify-center border-2 border-secondary mb-4">
                  {mainImage ? (
                    <img
                      src={mainImage.imageUrl}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-secondary">&gt; NO IMAGE AVAILABLE</span>
                  )}
                </div>

                {images && images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {images.map((img) => (
                      <div
                        key={img.id}
                        className="h-20 border-2 border-secondary cursor-pointer hover:border-primary transition-colors"
                      >
                        <img
                          src={img.imageUrl}
                          alt="Vehicle thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Vehicle Details */}
            <div>
              <Card className="neon-card mb-6">
                <div className="space-y-4">
                  <div className="border-b-2 border-secondary pb-4">
                    <p className="text-secondary text-sm">&gt; PRICE</p>
                    <p className="text-3xl font-bold text-primary">
                      ${parseFloat(vehicle.price.toString()).toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-secondary text-sm">&gt; YEAR</p>
                      <p className="text-lg font-bold">{vehicle.year}</p>
                    </div>

                    <div>
                      <p className="text-secondary text-sm">&gt; CATEGORY</p>
                      <p className="text-lg font-bold text-accent">
                        {vehicle.category.toUpperCase()}
                      </p>
                    </div>

                    {vehicle.mileage && (
                      <div>
                        <p className="text-secondary text-sm">&gt; MILEAGE</p>
                        <p className="text-lg font-bold">
                          {vehicle.mileage.toLocaleString()} KM
                        </p>
                      </div>
                    )}

                    {vehicle.color && (
                      <div>
                        <p className="text-secondary text-sm">&gt; COLOR</p>
                        <p className="text-lg font-bold">{vehicle.color}</p>
                      </div>
                    )}

                    {vehicle.transmission && (
                      <div>
                        <p className="text-secondary text-sm">&gt; TRANSMISSION</p>
                        <p className="text-lg font-bold">
                          {vehicle.transmission.toUpperCase()}
                        </p>
                      </div>
                    )}

                    {vehicle.fuelType && (
                      <div>
                        <p className="text-secondary text-sm">&gt; FUEL TYPE</p>
                        <p className="text-lg font-bold">
                          {vehicle.fuelType.toUpperCase()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              <Button className="w-full neon-button">CONTACT SELLER</Button>
            </div>
          </div>

          {/* Description */}
          {vehicle.description && (
            <div className="mt-8 neon-card">
              <p className="text-secondary text-sm mb-2">&gt; DESCRIPTION</p>
              <p className="text-foreground leading-relaxed">{vehicle.description}</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-secondary py-8 px-4 mt-12">
        <div className="container text-center">
          <p className="text-secondary text-sm">
            &gt; VEHICLE SHOWCASE CYBERPUNK EDITION
          </p>
        </div>
      </footer>
    </div>
  );
}
