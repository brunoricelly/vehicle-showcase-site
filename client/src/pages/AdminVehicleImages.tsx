import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Upload, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { validateImageFile, validateImageDimensions, formatFileSize } from "@/lib/imageValidation";

interface ImageMetadata {
  width?: number;
  height?: number;
  size: string;
  valid: boolean;
  error?: string;
}

export default function AdminVehicleImages() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { id } = useParams<{ id: string }>();
  const vehicleId = parseInt(id || "0", 10);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [imageMetadata, setImageMetadata] = useState<ImageMetadata[]>([]);

  const { data: vehicle, isLoading } = trpc.vehicles.getById.useQuery(
    { id: vehicleId },
    { enabled: vehicleId > 0 }
  );

  const { data: images } = trpc.vehicleImages.getByVehicleId.useQuery(
    { vehicleId },
    { enabled: vehicleId > 0 }
  );

  const utils = trpc.useUtils();
  const uploadMutation = trpc.vehicleImages.upload.useMutation({
    onSuccess: async (data) => {
      if (data && data.dimensions) {
        toast.success(`✅ Imagem enviada: ${data.dimensions.width}x${data.dimensions.height}px (${data.fileSize})`);
      } else {
        toast.success("✅ Imagem enviada com sucesso!");
      }
      // Invalidate cache to refresh images
      await utils.vehicleImages.getByVehicleId.invalidate({ vehicleId });
    },
    onError: (error) => {
      toast.error(`❌ Erro: ${error.message}`);
    },
  });

  const deleteMutation = trpc.vehicleImages.delete.useMutation({
    onSuccess: async () => {
      toast.success("Imagem deletada com sucesso!");
      // Invalidate cache to refresh images
      await utils.vehicleImages.getByVehicleId.invalidate({ vehicleId });
    },
    onError: (error) => {
      toast.error(`Erro ao deletar: ${error.message}`);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newMetadata: ImageMetadata[] = [];
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of files) {
      // Validate file basics
      const fileValidation = validateImageFile(file);
      if (!fileValidation.valid) {
        newMetadata.push({
          valid: false,
          size: formatFileSize(file.size),
          error: fileValidation.error,
        });
        continue;
      }

      // Generate preview and validate dimensions
      const reader = new FileReader();
      const previewData = await new Promise<{
        preview: string;
        metadata: ImageMetadata;
      }>((resolve) => {
        reader.onload = async (event) => {
          if (event.target?.result) {
            const preview = event.target.result as string;
            const dimValidation = await validateImageDimensions(preview);
            if (dimValidation.valid) {
              resolve({
                preview,
                metadata: {
                  width: dimValidation.width,
                  height: dimValidation.height,
                  size: formatFileSize(file.size),
                  valid: true,
                },
              });
            } else {
              resolve({
                preview: "",
                metadata: {
                  valid: false,
                  size: formatFileSize(file.size),
                  error: dimValidation.error,
                },
              });
            }
          }
        };
        reader.onerror = () => {
          resolve({
            preview: "",
            metadata: {
              valid: false,
              size: formatFileSize(file.size),
              error: "Erro ao ler arquivo",
            },
          });
        };
        reader.readAsDataURL(file);
      });

      if (previewData.metadata.valid) {
        validFiles.push(file);
        newPreviews.push(previewData.preview);
      }
      newMetadata.push(previewData.metadata);
    }

    setSelectedFiles([...selectedFiles, ...validFiles]);
    setPreviews([...previews, ...newPreviews]);
    setImageMetadata([...imageMetadata, ...newMetadata]);

    // Show validation messages
    const invalidCount = newMetadata.filter((m) => !m.valid).length;
    if (invalidCount > 0) {
      toast.error(`${invalidCount} imagem(ns) rejeitada(s) por validação`);
    }
    if (validFiles.length > 0) {
      toast.success(`${validFiles.length} imagem(ns) pronta(s) para upload`);
    }
  };

  const handleRemovePreview = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
    setImageMetadata(imageMetadata.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Selecione pelo menos uma imagem");
      return;
    }

    setIsUploading(true);

    // Upload each file
    for (const file of selectedFiles) {
      try {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            uploadMutation.mutate({
              vehicleId,
              fileName: file.name,
              imageData: event.target.result as string,
              mimeType: file.type || "image/jpeg",
            });
          }
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Erro ao fazer upload");
      }
    }

    // Clear after upload starts
    setTimeout(() => {
      setSelectedFiles([]);
      setPreviews([]);
      setImageMetadata([]);
      setIsUploading(false);
    }, 1000);
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
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-input"
                  />
                  <label htmlFor="file-input" className="cursor-pointer block">
                    <Upload className="mx-auto mb-2 text-secondary" size={32} />
                    <p className="text-sm text-muted-foreground">Clique para selecionar imagens</p>
                    <p className="text-xs text-muted-foreground mt-1">ou arraste e solte</p>
                  </label>
                </div>

                {/* Validation Info */}
                <div className="mt-4 p-3 bg-secondary/10 border border-secondary rounded text-xs text-muted-foreground space-y-1">
                  <p>✅ Dimensões: Até 8000x6000px</p>
                  <p>✅ Tamanho máx: 20MB</p>
                  <p>✅ Formatos: JPEG, PNG, WebP</p>
                </div>

                {/* Invalid Images */}
                {imageMetadata.some((m) => !m.valid) && (
                  <div className="mt-4 p-3 bg-destructive/10 border border-destructive rounded">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={16} className="text-destructive mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-destructive space-y-1">
                        {imageMetadata
                          .filter((m) => !m.valid)
                          .map((m, idx) => (
                            <p key={idx}>❌ {m.error}</p>
                          ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedFiles.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-secondary mb-2">&gt; {selectedFiles.length} FILE(S) SELECTED</p>
                    <Button onClick={handleUpload} disabled={isUploading} className="w-full neon-button">
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
                    {previews.map((preview, index) => {
                      const metadata = imageMetadata[index];
                      return (
                        <div key={index} className="relative border-2 border-secondary rounded overflow-hidden group">
                          <img src={preview} alt={`Preview ${index}`} className="w-full h-32 object-cover" />
                          <button
                            onClick={() => handleRemovePreview(index)}
                            className="absolute top-1 right-1 bg-destructive text-black p-1 rounded hover:bg-red-600"
                          >
                            <X size={16} />
                          </button>
                          {metadata && metadata.valid && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-xs text-foreground p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="truncate">
                                {metadata.width}x{metadata.height}px
                              </p>
                              <p className="truncate">{metadata.size}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              {/* Current Images */}
              {images && images.length > 0 && (
                <Card className="neon-card">
                  <h3 className="text-lg font-bold text-secondary mb-4">&gt; CURRENT IMAGES ({images.length})</h3>
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
