import { trpc } from "@/lib/trpc";

export function useStoreSettings() {
  const { data: settings, isLoading } = trpc.store.settings.useQuery();

  return {
    settings: settings || {
      storeName: "Exchange Motors",
      phone: "3826-2818",
      email: "contato@exchangemotors.com",
      address: "Rua Principal, 123",
      city: "São Paulo",
      state: "SP",
      zipCode: "01000-000",
      website: "www.exchangemotors.com",
      businessHours: "Seg-Sex: 9h-18h",
      saturdayHours: "Sáb: 9h-13h",
      sundayHours: "Dom: Fechado",
      whatsappNumber: "(19) 9999-9999",
      storeDescription: "Loja de veículos",
      logoUrl: "",
      bannerUrl: "",
    },
    isLoading,
  };
}
