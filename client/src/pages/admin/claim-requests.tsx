import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  User,
  Mail,
  Phone,
  MessageSquare,
  Building2,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function ClaimRequests() {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: claimRequests, isLoading } = useQuery({
    queryKey: ["/api/admin/claim-requests", selectedStatus],
    queryFn: () => apiRequest("GET", `/api/admin/claim-requests${selectedStatus !== "all" ? `?status=${selectedStatus}` : ""}`),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes?: string }) => {
      return apiRequest("PATCH", `/api/admin/claim-requests/${id}`, {
        status,
        adminNotes: notes || "",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/claim-requests"] });
      setSelectedRequest(null);
      setAdminNotes("");
      toast({
        title: "Stato aggiornato",
        description: "La richiesta di reclamo è stata aggiornata con successo.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante l'aggiornamento.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300"><Clock className="w-3 h-3 mr-1" />In attesa</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300"><CheckCircle className="w-3 h-3 mr-1" />Approvata</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300"><XCircle className="w-3 h-3 mr-1" />Rifiutata</Badge>;
      case "needs_verification":
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300"><AlertTriangle className="w-3 h-3 mr-1" />Verifica richiesta</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleApprove = (request: any) => {
    updateStatusMutation.mutate({
      id: request.id,
      status: "approved",
      notes: adminNotes,
    });
  };

  const handleReject = (request: any) => {
    updateStatusMutation.mutate({
      id: request.id,
      status: "rejected",
      notes: adminNotes,
    });
  };

  const handleNeedsVerification = (request: any) => {
    updateStatusMutation.mutate({
      id: request.id,
      status: "needs_verification",
      notes: adminNotes,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Richieste di Reclamo</h1>
          <p className="text-gray-600">Gestisci le richieste di reclamo profili da parte dei professionisti</p>
        </div>
        
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtra per stato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le richieste</SelectItem>
            <SelectItem value="pending">In attesa</SelectItem>
            <SelectItem value="approved">Approvate</SelectItem>
            <SelectItem value="rejected">Rifiutate</SelectItem>
            <SelectItem value="needs_verification">Verifica richiesta</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Richieste di Reclamo</CardTitle>
          <CardDescription>
            Elenco delle richieste di reclamo profili ricevute
          </CardDescription>
        </CardHeader>
        <CardContent>
          {claimRequests && claimRequests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Professionista</TableHead>
                  <TableHead>Richiedente</TableHead>
                  <TableHead>Data Richiesta</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {claimRequests.map((request: any) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.professional?.businessName}</div>
                        <div className="text-sm text-gray-500">{request.professional?.category?.name}</div>
                        <div className="text-sm text-gray-500">{request.professional?.city}, {request.professional?.province}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.requesterName}</div>
                        <div className="text-sm text-gray-500">{request.requesterEmail}</div>
                        {request.requesterPhone && (
                          <div className="text-sm text-gray-500">{request.requesterPhone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(request.status)}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setAdminNotes(request.adminNotes || "");
                            }}
                          >
                            Gestisci
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Gestisci Richiesta di Reclamo</DialogTitle>
                            <DialogDescription>
                              Revisiona i dettagli e decidi se approvare o rifiutare la richiesta
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedRequest && (
                            <div className="space-y-6">
                              {/* Professional Info */}
                              <div className="bg-blue-50 rounded-lg p-4">
                                <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                                  <Building2 className="w-5 h-5 mr-2" />
                                  Profilo Professionale
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium">Nome attività:</span>
                                    <div>{selectedRequest.professional?.businessName}</div>
                                  </div>
                                  <div>
                                    <span className="font-medium">Categoria:</span>
                                    <div>{selectedRequest.professional?.category?.name}</div>
                                  </div>
                                  <div>
                                    <span className="font-medium">Indirizzo:</span>
                                    <div>{selectedRequest.professional?.address}</div>
                                  </div>
                                  <div>
                                    <span className="font-medium">Città:</span>
                                    <div>{selectedRequest.professional?.city}, {selectedRequest.professional?.province}</div>
                                  </div>
                                </div>
                              </div>

                              {/* Requester Info */}
                              <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                                  <User className="w-5 h-5 mr-2" />
                                  Informazioni Richiedente
                                </h3>
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center">
                                    <User className="w-4 h-4 mr-2 text-gray-500" />
                                    <span className="font-medium mr-2">Nome:</span>
                                    {selectedRequest.requesterName}
                                  </div>
                                  <div className="flex items-center">
                                    <Mail className="w-4 h-4 mr-2 text-gray-500" />
                                    <span className="font-medium mr-2">Email:</span>
                                    {selectedRequest.requesterEmail}
                                  </div>
                                  {selectedRequest.requesterPhone && (
                                    <div className="flex items-center">
                                      <Phone className="w-4 h-4 mr-2 text-gray-500" />
                                      <span className="font-medium mr-2">Telefono:</span>
                                      {selectedRequest.requesterPhone}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Personal Message */}
                              <div>
                                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                                  <MessageSquare className="w-5 h-5 mr-2" />
                                  Messaggio di Verifica
                                </h3>
                                <div className="bg-white border rounded-lg p-3 text-sm">
                                  {selectedRequest.personalMessage}
                                </div>
                              </div>

                              {/* Admin Notes */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Note Admin (opzionale)
                                </label>
                                <Textarea
                                  value={adminNotes}
                                  onChange={(e) => setAdminNotes(e.target.value)}
                                  placeholder="Aggiungi note per la revisione..."
                                  className="min-h-[80px]"
                                />
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-3 pt-4">
                                <Button
                                  onClick={() => handleApprove(selectedRequest)}
                                  disabled={updateStatusMutation.isPending}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approva
                                </Button>
                                <Button
                                  onClick={() => handleNeedsVerification(selectedRequest)}
                                  disabled={updateStatusMutation.isPending}
                                  variant="outline"
                                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
                                >
                                  <AlertTriangle className="w-4 h-4 mr-2" />
                                  Richiedi Verifica
                                </Button>
                                <Button
                                  onClick={() => handleReject(selectedRequest)}
                                  disabled={updateStatusMutation.isPending}
                                  variant="destructive"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Rifiuta
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Nessuna richiesta di reclamo trovata</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}