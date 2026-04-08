import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
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

  const categories = ["sedan", "suv", "sports", "truck", "van", "hatchback"];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b-2 border-secondary py-6 px-4 scan-lines">
        <div className="container">
          <div className="flex items-center justify-between">
            <div className="hud-corner">
              <h1 className="text-4xl font-bold neon-glow">VEHICLE SHOWCASE</h1>
              <p className="text-sm text-secondary mt-2">[ CYBERPUNK EDITION ]</p>
            </div>

            <div className="flex gap-4">
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">{user?.name}</span>
                  {user?.role === "admin" && (
                    <Link href="/admin">
                      <Button className="neon-button">ADMIN PANEL</Button>
                    </Link>
                  )}
                </div>
              ) : (
                <a href={getLoginUrl()}>
                  <Button className="neon-button">LOGIN</Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4 border-b-2 border-secondary">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold neon-glow mb-4">
              EXPLORE THE FUTURE OF VEHICLES
            </h2>
            <p className="text-secondary text-lg">
              &gt; IMMERSE YOURSELF IN OUR PREMIUM COLLECTION
            </p>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 neon-card">
            <div>
              <label className="text-sm text-secondary block mb-2">&gt; SEARCH</label>
              <Input
                type="text"
                name="search"
                placeholder="Brand, model..."
                value={filters.search}
                onChange={handleFilterChange}
                className="neon-input"
              />
            </div>

            <div>
              <label className="text-sm text-secondary block mb-2">&gt; CATEGORY</label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="neon-input w-full"
              >
                <option value="">ALL CATEGORIES</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-secondary block mb-2">&gt; MIN PRICE</label>
              <Input
                type="number"
                name="minPrice"
                placeholder="0"
                value={filters.minPrice}
                onChange={handleFilterChange}
                className="neon-input"
              />
            </div>

            <div>
              <label className="text-sm text-secondary block mb-2">&gt; MAX PRICE</label>
              <Input
                type="number"
                name="maxPrice"
                placeholder="999999"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                className="neon-input"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Vehicles Grid */}
      <section className="py-12 px-4">
        <div className="container">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-secondary animate-pulse">&gt; LOADING VEHICLES...</p>
            </div>
          ) : vehicles && vehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <Link key={vehicle.id} href={`/vehicle/${vehicle.id}`}>
                  <Card className="neon-card cursor-pointer hover:pulse-glow transition-all duration-300 h-full">
                    <div className="mb-4">
                      <div className="bg-muted h-48 flex items-center justify-center border-2 border-secondary">
                        <span className="text-secondary text-sm">&gt; IMAGE PLACEHOLDER</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-primary">
                        {vehicle.brand.toUpperCase()} {vehicle.model.toUpperCase()}
                      </h3>

                      <div className="flex justify-between text-sm">
                        <span className="text-secondary">&gt; {vehicle.year}</span>
                        <span className="text-accent">{vehicle.category.toUpperCase()}</span>
                      </div>

                      <div className="pt-2 border-t-2 border-secondary">
                        <p className="text-2xl font-bold text-primary">
                          ${parseFloat(vehicle.price.toString()).toLocaleString()}
                        </p>
                      </div>

                      {vehicle.mileage && (
                        <p className="text-xs text-muted-foreground">
                          &gt; {vehicle.mileage.toLocaleString()} KM
                        </p>
                      )}

                      <Button className="w-full neon-button mt-4">
                        VIEW DETAILS
                      </Button>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 neon-card">
              <p className="text-secondary text-lg">&gt; NO VEHICLES FOUND</p>
              <p className="text-muted-foreground mt-2">TRY ADJUSTING YOUR FILTERS</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-secondary py-8 px-4 mt-12">
        <div className="container text-center">
          <p className="text-secondary text-sm">
            &gt; VEHICLE SHOWCASE CYBERPUNK EDITION | POWERED BY NEON TECHNOLOGY
          </p>
          <p className="text-muted-foreground text-xs mt-2">
            [ 2026 ] FUTURE IS NOW
          </p>
        </div>
      </footer>
    </div>
  );
}
