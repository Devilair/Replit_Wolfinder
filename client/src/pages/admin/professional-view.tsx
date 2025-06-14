import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SimpleDocumentViewer } from "@/components/simple-document-viewer";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail, 
  Phone, 
  MapPin, 
  Star,
  Calendar,
  Edit,
  FileText,
  Shield,
  Crown
} from "lucide-react";

export default function AdminProfessionalView() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: professional, isLoading } = useQuery({
    queryKey: [`/api/admin/professionals/${id}`],
  });

  const { data: verificationDocuments } = useQuery({
    queryKey: [`/api/admin/professionals/${id}/verification-documents`],
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Professionista non trovato</h1>
        <Button onClick={() => setLocation("/admin/professionals")}>
          Torna alla lista
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/admin/professionals")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alla lista
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{professional.businessName}</h1>
            <p className="text-gray-600">ID: {professional.id}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setLocation(`/admin/professionals/${id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Modifica
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${getStatusColor(professional.verificationStatus)}`}>
                {getStatusIcon(professional.verificationStatus)}
              </div>
              <div>
                <p className="text-sm text-gray-600">Stato Verifica</p>
                <p className="font-semibold capitalize">{professional.verificationStatus}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${professional.isPremium ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                <Crown className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tipo Account</p>
                <p className="font-semibold">{professional.isPremium ? 'Premium' : 'Standard'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${professional.isClaimed ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Stato Claim</p>
                <p className="font-semibold">{professional.isClaimed ? 'Reclamato' : 'Non Reclamato'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informazioni Principali</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{professional.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Telefono Fisso</p>
                  <p className="font-medium">{professional.phoneFixed || 'Non specificato'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Cellulare</p>
                  <p className="font-medium">{professional.phoneMobile || 'Non specificato'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Indirizzo</p>
                  <p className="font-medium">{professional.address}</p>
                  <p className="text-sm text-gray-500">{professional.city}, {professional.province}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Categoria</p>
                  <p className="font-medium">{professional.category?.name}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistiche</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-lg font-bold">{professional.rating || '0.0'}</span>
                </div>
                <p className="text-sm text-gray-600">Valutazione</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-lg font-bold mb-2">{professional.reviewCount || 0}</div>
                <p className="text-sm text-gray-600">Recensioni</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold mb-2">{professional.profileViews || 0}</div>
                <p className="text-sm text-gray-600">Visualizzazioni</p>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-lg font-bold mb-2">{professional.profileCompleteness || 0}%</div>
                <p className="text-sm text-gray-600">Completezza</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {professional.description && (
        <Card>
          <CardHeader>
            <CardTitle>Descrizione</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{professional.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Verification Documents */}
      {verificationDocuments && verificationDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Documenti di Verifica</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {verificationDocuments.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline">{doc.documentType}</Badge>
                      <Badge className={getStatusColor(doc.status)}>
                        {getStatusIcon(doc.status)}
                        <span className="ml-1 capitalize">{doc.status}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      File: {doc.originalFileName || doc.fileName} ({(doc.fileSize / 1024 / 1024).toFixed(2)} MB)
                    </p>
                    <p className="text-xs text-gray-500">
                      Caricato il {formatDate(doc.createdAt)}
                    </p>
                  </div>
                  <SimpleDocumentViewer
                    fileName={doc.fileName}
                    originalFileName={doc.originalFileName}
                    fileSize={doc.fileSize}
                    documentId={doc.id}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Registrazione</p>
                <p className="text-xs text-gray-500">{formatDate(professional.createdAt)}</p>
              </div>
            </div>
            
            {professional.verificationDate && (
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Verifica completata</p>
                  <p className="text-xs text-gray-500">{formatDate(professional.verificationDate)}</p>
                </div>
              </div>
            )}
            
            {professional.lastActivityAt && (
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Ultima attività</p>
                  <p className="text-xs text-gray-500">{formatDate(professional.lastActivityAt)}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}