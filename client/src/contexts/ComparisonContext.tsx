import { createContext, useContext, useState, ReactNode } from "react";

export interface ComparisonVehicle {
  id: number;
  brand: string;
  model: string;
  year: number;
  price: string;
  mileage: number | null;
  category: string;
  color: string | null;
  transmission: string | null;
  description: string | null;
  images?: Array<{
    id: number;
    vehicleId: number;
    imageUrl: string;
    imageKey: string;
    displayOrder: number;
    isMainImage: boolean;
    createdAt: Date;
  }>;
}

interface ComparisonContextType {
  selectedVehicles: ComparisonVehicle[];
  addVehicle: (vehicle: ComparisonVehicle) => void;
  removeVehicle: (vehicleId: number) => void;
  clearComparison: () => void;
  isVehicleSelected: (vehicleId: number) => boolean;
  canAddMore: () => boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [selectedVehicles, setSelectedVehicles] = useState<ComparisonVehicle[]>([]);

  const addVehicle = (vehicle: ComparisonVehicle) => {
    if (selectedVehicles.length < 3 && !selectedVehicles.some((v) => v.id === vehicle.id)) {
      setSelectedVehicles([...selectedVehicles, vehicle]);
    }
  };

  const removeVehicle = (vehicleId: number) => {
    setSelectedVehicles(selectedVehicles.filter((v) => v.id !== vehicleId));
  };

  const clearComparison = () => {
    setSelectedVehicles([]);
  };

  const isVehicleSelected = (vehicleId: number) => {
    return selectedVehicles.some((v) => v.id === vehicleId);
  };

  const canAddMore = () => {
    return selectedVehicles.length < 3;
  };

  return (
    <ComparisonContext.Provider
      value={{
        selectedVehicles,
        addVehicle,
        removeVehicle,
        clearComparison,
        isVehicleSelected,
        canAddMore,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error("useComparison must be used within ComparisonProvider");
  }
  return context;
}
