import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Download, X } from "lucide-react";

interface SimpleDocumentViewerProps {
  fileName: string;
  originalFileName?: string;
  fileSize: number;
  documentId?: number;
}

export function SimpleDocumentViewer({ fileName, originalFileName, fileSize, documentId }: SimpleDocumentViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const token = localStorage.getItem('authToken');
  const isPdf = /\.pdf$/i.test(originalFileName || fileName);
  const isImage = /\.(jpg|jpeg|png|gif|tiff)$/i.test(originalFileName || fileName);
  
  const viewUrl = documentId 
    ? `/api/view-document/${documentId}?token=${encodeURIComponent(token || '')}`
    : `/uploads/${fileName}`;
    
  const downloadUrl = documentId
    ? `/api/download-document/${documentId}?token=${encodeURIComponent(token || '')}`
    : `/uploads/${fileName}`;

  const handleView = () => {
    setIsOpen(true);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = originalFileName || fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="flex gap-2">
        <Button 
          size="sm" 
          variant="outline"
          onClick={handleView}
        >
          <Eye className="h-4 w-4 mr-1" />
          Visualizza
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4 mr-1" />
          Scarica
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>{originalFileName || fileName}</DialogTitle>
                <p className="text-sm text-gray-500">
                  {(fileSize / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-1" />
                  Scarica
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex-1 p-4 pt-0">
            {isPdf && (
              <div className="w-full h-[600px] border rounded overflow-hidden bg-gray-50">
                <object
                  data={viewUrl}
                  type="application/pdf"
                  className="w-full h-full"
                >
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center p-4">
                      <p className="text-gray-600 mb-4">
                        Il browser non supporta la visualizzazione PDF.
                      </p>
                      <Button onClick={handleDownload} variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Scarica PDF
                      </Button>
                    </div>
                  </div>
                </object>
              </div>
            )}
            
            {isImage && (
              <div className="flex justify-center">
                <img
                  src={viewUrl}
                  alt={originalFileName || fileName}
                  className="max-w-full max-h-[600px] object-contain rounded"
                />
              </div>
            )}
            
            {!isPdf && !isImage && (
              <div className="text-center p-8">
                <p className="text-gray-500 mb-4">
                  Anteprima non disponibile per questo tipo di file
                </p>
                <Button onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Scarica documento
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}