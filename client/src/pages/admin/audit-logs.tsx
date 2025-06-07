import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Eye, User, Settings, FileText, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

interface AuditLog {
  id: number;
  userId: number;
  action: string;
  targetType: string;
  targetId: number;
  oldValues?: string;
  newValues?: string;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [targetTypeFilter, setTargetTypeFilter] = useState("all");

  const { data: auditLogs = [], isLoading } = useQuery({
    queryKey: ['/api/admin/audit-logs', { search: searchTerm, action: actionFilter, targetType: targetTypeFilter }],
  });

  const getActionIcon = (action: string) => {
    if (action.includes('approve') || action.includes('verify')) return <User className="h-4 w-4 text-green-600" />;
    if (action.includes('reject') || action.includes('deny')) return <FileText className="h-4 w-4 text-red-600" />;
    if (action.includes('update') || action.includes('modify')) return <Settings className="h-4 w-4 text-blue-600" />;
    return <Eye className="h-4 w-4 text-gray-600" />;
  };

  const getActionBadge = (action: string) => {
    if (action.includes('approve') || action.includes('verify')) {
      return <Badge variant="success" className="bg-green-100 text-green-800">Approvazione</Badge>;
    }
    if (action.includes('reject') || action.includes('deny')) {
      return <Badge variant="destructive">Rifiuto</Badge>;
    }
    if (action.includes('update') || action.includes('modify')) {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Modifica</Badge>;
    }
    return <Badge variant="outline">Visualizzazione</Badge>;
  };

  const getTargetTypeBadge = (targetType: string) => {
    const colors = {
      professional: "bg-purple-100 text-purple-800",
      review: "bg-orange-100 text-orange-800",
      subscription: "bg-cyan-100 text-cyan-800",
      user: "bg-gray-100 text-gray-800",
    };
    
    return (
      <Badge variant="outline" className={colors[targetType as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {targetType}
      </Badge>
    );
  };

  const formatChanges = (oldValues?: string, newValues?: string) => {
    if (!oldValues || !newValues) return null;
    
    try {
      const old = JSON.parse(oldValues);
      const new_ = JSON.parse(newValues);
      
      const changes = Object.keys(new_).filter(key => old[key] !== new_[key]);
      if (changes.length === 0) return null;
      
      return (
        <div className="text-xs space-y-1">
          {changes.slice(0, 3).map(key => (
            <div key={key} className="flex items-center gap-2">
              <span className="font-medium">{key}:</span>
              <span className="text-red-600 line-through">{String(old[key])}</span>
              <span className="text-green-600">{String(new_[key])}</span>
            </div>
          ))}
          {changes.length > 3 && (
            <div className="text-gray-500">+{changes.length - 3} altre modifiche</div>
          )}
        </div>
      );
    } catch {
      return null;
    }
  };

  const filteredLogs = auditLogs.filter((log: AuditLog) => {
    const matchesSearch = !searchTerm || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === "all" || log.action.includes(actionFilter);
    const matchesTargetType = targetTypeFilter === "all" || log.targetType === targetTypeFilter;
    
    return matchesSearch && matchesAction && matchesTargetType;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Audit Log</h1>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="h-20 bg-gray-100 rounded"></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Audit Log</h1>
          <p className="text-gray-600 mt-1">Tracciamento completo delle azioni amministrative</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-600">{filteredLogs.length} voci</span>
        </div>
      </div>

      {/* Filtri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtri di Ricerca
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cerca per azione, utente o motivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo di azione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le azioni</SelectItem>
                <SelectItem value="approve">Approvazioni</SelectItem>
                <SelectItem value="reject">Rifiuti</SelectItem>
                <SelectItem value="update">Modifiche</SelectItem>
                <SelectItem value="verify">Verifiche</SelectItem>
              </SelectContent>
            </Select>

            <Select value={targetTypeFilter} onValueChange={setTargetTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo di target" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i target</SelectItem>
                <SelectItem value="professional">Professionisti</SelectItem>
                <SelectItem value="review">Recensioni</SelectItem>
                <SelectItem value="subscription">Abbonamenti</SelectItem>
                <SelectItem value="user">Utenti</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabella Audit Log */}
      <Card>
        <CardHeader>
          <CardTitle>Registro delle Attività</CardTitle>
          <CardDescription>
            Cronologia completa delle azioni amministrative con dettagli delle modifiche
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Azione</TableHead>
                <TableHead>Amministratore</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Modifiche</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log: AuditLog) => (
                <TableRow key={log.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getActionIcon(log.action)}
                      <div>
                        <div className="font-medium">{log.action}</div>
                        {getActionBadge(log.action)}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Admin'}
                      </div>
                      <div className="text-sm text-gray-500">{log.user?.email}</div>
                      {log.ipAddress && (
                        <div className="text-xs text-gray-400">IP: {log.ipAddress}</div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTargetTypeBadge(log.targetType)}
                      <span className="text-sm">#{log.targetId}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {formatChanges(log.oldValues, log.newValues) || (
                      <span className="text-gray-400 text-sm">Nessuna modifica registrata</span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {log.reason ? (
                      <div className="max-w-xs truncate" title={log.reason}>
                        {log.reason}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm">
                      {formatDistanceToNow(new Date(log.createdAt), { 
                        addSuffix: true, 
                        locale: it 
                      })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(log.createdAt).toLocaleString('it-IT')}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredLogs.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun log trovato</h3>
              <p className="text-gray-500">
                Non ci sono voci che corrispondono ai filtri selezionati.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}