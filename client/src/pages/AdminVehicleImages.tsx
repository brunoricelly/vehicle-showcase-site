import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Upload } from "lucide-react";
import { toast } from "sonner";

export default function AdminVehicleImages() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { id } = useParams<{ id: string }>();
  const vehicleId = parseInt(id || "0", 10);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { data: vehicle, isLoading } = trpc.vehicles.getById.useQuery(
    { id: vehicleId },
    { enabled: vehicleId > 0 }
  );

  const { data: images } = trpc.vehicleImages.getByVehicleId.useQuery(
    { vehicleId },
    { enabled: vehicleId > 0 }
  );

  const uploadMutation = trpc.vehicleImages.upload.useMutation({
    onSuccess: () => {
      setSelectedFiles([]);
      setPreviews([]);
      toast.success("Images uploaded successfully!");
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  const deleteMutation = trpc.vehicleImages.delete.useMutation({
    onSuccess: () => {
      toast.success("Image deleted successfully!");
    },
    onError: (error) => {
      toast.error(`Delete failed: ${error.message}`);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    // Generate previews
    const newPreviews = [...previews];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newPreviews.push(event.target.result as string);
          setPreviews([...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePreview = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    setIsUploading(true);

    // Upload each file
    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            uploadMutation.mutate({
              vehicleId,
              fileName: file.name,
              imageData: event.target.result as string,
            });
          }
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Upload error:", error);
      }
    }

    setIsUploading(false);
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
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold neon-glow">MANAGE IMAGES</h1>
            <Button onClick={() => setLocation(`/admin/vehicle/${vehicleId}`)} className="neon-button">
              ← BACK
            </Button>
          </div>
          {vehicle && (
            <p className="text-secondary mt-2">
              {vehicle.brand} {vehicle.model} ({vehicle.year})
            </p>
          )}
        </div>
      </header>

      <section className="py-12 px-4">
        <div className="container max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload Section */}
            <div className="lg:col-span-1">
              <Card className="neon-card sticky top-4">
                <h2 className="text-lg font-bold text-secondary mb-4">&gt; UPLOAD IMAGES</h2>

                <div className="border-2 border-dashed border-secondary rounded p-4 text-center cursor-pointer hover:border-primary transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-input"
                  />
                  <label htmlFor="file-input" className="cursor-pointer block">
                    <Upload className="mx-auto mb-2 text-secondary" size={32} />
                    <p className="text-sm text-muted-foreground">Click to select images</p>
                    <p className="text-xs text-muted-foreground mt-1">or drag and drop</p>
                  </label>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-secondary mb-2">&gt; {selectedFiles.length} FILE(S) SELECTED</p>
                    <Button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="w-full neon-button"
                    >
                      {isUploading ? "UPLOADING..." : "UPLOAD ALL"}
                    </Button>
                  </div>
                )}
              </Card>
            </div>

            {/* Preview & Current Images */}
            <div className="lg:col-span-2 space-y-6">
              {/* Previews */}
              {previews.length > 0 && (
                <Card className="neon-card">
                  <h3 className="text-lg font-bold text-secondary mb-4">&gt; PREVIEW</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {previews.map((preview, index) => (
                      <div key={index} className="relative border-2 border-secondary rounded overflow-hidden">
                        <img src={preview} alt={`Preview ${index}`} className="w-full h-32 object-cover" />
                        <button
                          onClick={() => handleRemovePreview(index)}
                          className="absolute top-1 right-1 bg-destructive text-black p-1 rounded hover:bg-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Current Images */}
              {images && images.length > 0 && (
                <Card className="neon-card">
                  <h3 className="text-lg font-bold text-secondary mb-4">&gt; CURRENT IMAGES</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((image) => (
                      <div key={image.id} className="relative border-2 border-secondary rounded overflow-hidden group">
                        <img src={image.imageUrl} alt="Vehicle" className="w-full h-32 object-cover" />
                        <button
                          onClick={() => deleteMutation.mutate({ id: image.id })}
                          className="absolute top-1 right-1 bg-destructive text-black p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X size={16} />
                        </button>
                        <p className="absolute bottom-0 left-0 right-0 bg-black/80 text-xs text-foreground p-1 truncate">
                          Image #{image.displayOrder}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {!images || images.length === 0 ? (
                <Card className="neon-card text-center py-12">
                  <p className="text-secondary">&gt; NO IMAGES YET</p>
                  <p className="text-muted-foreground text-sm mt-2">Upload images to get started</p>
                </Card>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
