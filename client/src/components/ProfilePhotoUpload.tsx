import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Camera, Upload, X, Image } from "lucide-react";

interface ProfilePhotoUploadProps {
  professionalId: string;
  currentPhotoUrl?: string;
  onPhotoUpdated?: (newPhotoUrl: string) => void;
}

export default function ProfilePhotoUpload({ 
  professionalId, 
  currentPhotoUrl, 
  onPhotoUpdated 
}: ProfilePhotoUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('professionalId', professionalId);

      const response = await fetch('/api/professionals/upload-photo', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Errore durante l\'upload');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Foto caricata",
        description: "La foto del profilo è stata aggiornata con successo",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/professionals/${professionalId}`] });
      
      // Call callback if provided
      if (onPhotoUpdated && data.photoUrl) {
        onPhotoUpdated(data.photoUrl);
      }
      
      setPreview(null);
    },
    onError: (error: any) => {
      toast({
        title: "Errore upload",
        description: error.message || "Errore durante il caricamento della foto",
        variant: "destructive",
      });
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Formato non supportato",
        description: "Sono supportati solo file JPG, PNG e WebP",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File troppo grande",
        description: "La foto deve essere inferiore a 5MB",
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadMutation.mutate(file);
  };

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('DELETE', `/api/professionals/${professionalId}/photo`);
    },
    onSuccess: () => {
      toast({
        title: "Foto rimossa",
        description: "La foto del profilo è stata rimossa",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/professionals/${professionalId}`] });
      if (onPhotoUpdated) {
        onPhotoUpdated('');
      }
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Errore durante la rimozione della foto",
        variant: "destructive",
      });
    },
  });

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4 flex items-center justify-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            Foto Profilo
          </h3>

          {/* Current Photo Display */}
          {currentPhotoUrl && !preview && (
            <div className="relative inline-block mb-4">
              <img
                src={currentPhotoUrl}
                alt="Foto profilo"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 shadow-lg"
              />
              <Button
                size="sm"
                variant="destructive"
                className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Preview */}
          {preview && (
            <div className="relative inline-block mb-4">
              <img
                src={preview}
                alt="Anteprima"
                className="w-32 h-32 rounded-full object-cover border-4 border-green-200 shadow-lg"
              />
              <div className="absolute inset-0 bg-green-500/20 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
          )}

          {/* Upload Area */}
          {!currentPhotoUrl && !preview && (
            <div className="mb-4">
              <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300">
                <Image className="w-12 h-12 text-gray-400" />
              </div>
            </div>
          )}

          {/* Drag & Drop Area */}
          <div
            className={`border-2 border-dashed rounded-xl p-6 transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="photo-upload"
              className="hidden"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileInput}
            />
            
            <div className="text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                Trascina qui la tua foto o
              </p>
              <Button
                variant="outline"
                onClick={() => document.getElementById('photo-upload')?.click()}
                disabled={uploadMutation.isPending}
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                Seleziona file
              </Button>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-500 space-y-1">
            <p>• Formati supportati: JPG, PNG, WebP</p>
            <p>• Dimensione massima: 5MB</p>
            <p>• Risoluzione consigliata: 400x400px</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}