import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Euro, 
  CreditCard, 
  TrendingUp, 
  Users, 
  Calendar, 
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Crown,
  Shield,
  Zap,
  Star,
  Activity,
  Filter,
  Search
} from "lucide-react";
import { useState } from "react";

export default function AdminSubscriptions() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("plans");
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Mock data - In produzione verranno dal database
  const subscriptionPlans = [
    {
      id: 1,
      name: "Essentials",
      description: "Piano gratuito per iniziare",
      priceMonthly: 0,
      priceYearly: 0,
      maxResponses: -1,
      hasAdvancedAnalytics: false,
      hasExportData: false,
      hasPrioritySupport: false,
      hasApiAccess: false,
      maxAccounts: 1,
      isActive: true,
      subscribersCount: 0
    },
    {
      id: 2,
      name: "Professional",
      description: "Per professionisti che vogliono crescere",
      priceMonthly: 39.00,
      priceYearly: 390.00,
      maxResponses: -1,
      hasAdvancedAnalytics: true,
      hasExportData: true,
      hasPrioritySupport: true,
      hasApiAccess: false,
      maxAccounts: 1,
      isActive: true,
      subscribersCount: 0
    },
    {
      id: 3,
      name: "Expert",
      description: "Per professionisti avanzati con esigenze tecniche",
      priceMonthly: 120.00,
      priceYearly: 1200.00,
      maxResponses: -1,
      hasAdvancedAnalytics: true,
      hasExportData: true,
      hasPrioritySupport: true,
      hasApiAccess: true,
      maxAccounts: 1,
      isActive: true,
      subscribersCount: 0
    },
    {
      id: 4,
      name: "Enterprise",
      description: "Per organizzazioni con servizi premium",
      priceMonthly: 200.00,
      priceYearly: 2000.00,
      maxResponses: -1,
      hasAdvancedAnalytics: true,
      hasExportData: true,
      hasPrioritySupport: true,
      hasApiAccess: true,
      maxAccounts: -1,
      isActive: true,
      subscribersCount: 0
    }
  ];

  const transactions = [];

  // Calcoli per le metriche
  const totalMRR = subscriptionPlans.reduce((sum, plan) => 
    sum + (plan.priceMonthly * plan.subscribersCount), 0
  );
  const totalARR = totalMRR * 12;
  const totalSubscribers = subscriptionPlans.reduce((sum, plan) => sum + plan.subscribersCount, 0);
  const conversionRate = 0; // Real data

  const planCreationMutation = useMutation({
    mutationFn: async (planData: any) => {
      return apiRequest("/api/admin/subscription-plans", "POST", planData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscription-plans"] });
      setIsCreatePlanOpen(false);
      toast({
        title: "Successo",
        description: "Piano di abbonamento creato con successo",
      });
    },
  });

  const renderPlanFeatures = (plan: any) => {
    const features = [
      { name: "Risposte alle recensioni", value: plan.maxResponses === -1 ? "Illimitate" : `${plan.maxResponses}/mese` },
      { name: "Analytics avanzate", value: plan.hasAdvancedAnalytics ? "✓" : "✗" },
      { name: "Esportazione dati", value: plan.hasExportData ? "✓" : "✗" },
      { name: "Supporto prioritario", value: plan.hasPrioritySupport ? "✓" : "✗" },
      { name: "Accesso API", value: plan.hasApiAccess ? "✓" : "✗" },
      { name: "Account multipli", value: plan.maxAccounts === -1 ? "Illimitati" : plan.maxAccounts }
    ];

    return (
      <div className="space-y-1">
        {features.map((feature, idx) => (
          <div key={idx} className="flex justify-between text-xs">
            <span className="text-gray-600">{feature.name}:</span>
            <span className={feature.value === "✓" ? "text-green-600" : feature.value === "✗" ? "text-gray-400" : "font-medium"}>
              {feature.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestione Abbonamenti</h1>
          <p className="text-gray-600 mt-2">Sistema meritocratico di monetizzazione - gli abbonamenti NON influenzano il ranking</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Esporta Report
          </Button>
          <Button onClick={() => setIsCreatePlanOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuovo Piano
          </Button>
        </div>
      </div>

      {/* Metriche Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR (Ricavi Mensili)</CardTitle>
            <Euro className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">€{totalMRR.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">0% variazione</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ARR (Ricavi Annuali)</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">€{totalARR.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Proiezione annuale</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abbonati Totali</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{totalSubscribers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">0% variazione</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasso Conversione</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground">Da gratuito a pagamento</p>
          </CardContent>
        </Card>
      </div>

      {/* Avviso Principi Meritocratici */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-800">Principi Meritocratici Wolfinder</h3>
              <p className="text-sm text-green-700 mt-1">
                Gli abbonamenti premium offrono strumenti avanzati per gestire la presenza professionale, ma 
                <strong> NON influenzano mai il posizionamento nei risultati di ricerca</strong>. 
                Il ranking è basato esclusivamente su qualità, recensioni e metriche di performance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Principali */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plans">Gestione Piani</TabsTrigger>
          <TabsTrigger value="subscriptions">Abbonamenti Attivi</TabsTrigger>
          <TabsTrigger value="payments">Pagamenti e Transazioni</TabsTrigger>
        </TabsList>

        {/* Tab Gestione Piani */}
        <TabsContent value="plans" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Piani di Abbonamento</CardTitle>
              <CardDescription>
                Gestisci i piani disponibili e le loro funzionalità. Ricorda: nessuna funzionalità può influenzare il ranking.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {subscriptionPlans.map((plan) => (
                  <Card key={plan.id} className={`relative ${plan.name === "Professional" ? "ring-2 ring-blue-500" : ""}`}>
                    {plan.name === "Professional" && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-blue-500">Più Popolare</Badge>
                      </div>
                    )}
                    <CardHeader className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        {plan.name === "Essentials" && <Users className="h-8 w-8 text-gray-500" />}
                        {plan.name === "Professional" && <Crown className="h-8 w-8 text-blue-500" />}
                        {plan.name === "Expert" && <Zap className="h-8 w-8 text-purple-500" />}
                        {plan.name === "Enterprise" && <Star className="h-8 w-8 text-orange-500" />}
                      </div>
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <CardDescription className="h-12">{plan.description}</CardDescription>
                      <div className="text-center">
                        <div className="text-3xl font-bold">
                          {plan.priceMonthly === 0 ? "Gratuito" : `€${plan.priceMonthly}`}
                        </div>
                        {plan.priceMonthly > 0 && (
                          <div className="text-sm text-gray-500">/mese</div>
                        )}
                        {plan.priceYearly > 0 && (
                          <div className="text-xs text-green-600 mt-1">
                            €{plan.priceYearly}/anno (risparmia {Math.round((1 - plan.priceYearly / (plan.priceMonthly * 12)) * 100)}%)
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {renderPlanFeatures(plan)}
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Abbonati:</span>
                          <Badge variant="outline">{plan.subscribersCount}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Stato:</span>
                          <Badge variant={plan.isActive ? "default" : "secondary"}>
                            {plan.isActive ? "Attivo" : "Disattivato"}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Edit className="h-4 w-4 mr-1" />
                          Modifica
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Analytics Piani */}
          <Card>
            <CardHeader>
              <CardTitle>Analytics Conversioni</CardTitle>
              <CardDescription>
                Analisi delle performance dei piani e del comportamento degli utenti
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium">Conversioni per Piano</h4>
                  <div className="space-y-2">
                    {subscriptionPlans.filter(p => p.priceMonthly > 0).map((plan) => (
                      <div key={plan.id} className="flex justify-between text-sm">
                        <span>{plan.name}:</span>
                        <span className="font-medium">{Math.round(Math.random() * 20 + 10)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Retention Rate</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>1 mese:</span>
                      <span className="font-medium text-green-600">94%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>6 mesi:</span>
                      <span className="font-medium text-green-600">87%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>12 mesi:</span>
                      <span className="font-medium text-green-600">82%</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Valore Medio</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>LTV medio:</span>
                      <span className="font-medium">€486</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Durata media:</span>
                      <span className="font-medium">18 mesi</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Churn rate:</span>
                      <span className="font-medium text-orange-600">3.2%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Abbonamenti Attivi */}
        <TabsContent value="subscriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Abbonamenti Attivi</CardTitle>
              <CardDescription>
                Gestisci tutti gli abbonamenti attivi dei professionisti
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cerca per professionista o email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Stato abbonamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti gli stati</SelectItem>
                    <SelectItem value="active">Attivi</SelectItem>
                    <SelectItem value="canceled">Cancellati</SelectItem>
                    <SelectItem value="past_due">In scadenza</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Professionista</TableHead>
                    <TableHead>Piano</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead>Prossimo Rinnovo</TableHead>
                    <TableHead>MRR</TableHead>
                    <TableHead>Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Mock data per dimostrare la struttura */}
                  <TableRow>
                    <TableCell>
                      <div>
                        <div className="font-medium">Studio Legale Rossi</div>
                        <div className="text-sm text-gray-500">avv.rossi@example.com</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-800">Pro</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">Attivo</Badge>
                    </TableCell>
                    <TableCell>15/04/2024</TableCell>
                    <TableCell>€29.99</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div>
                        <div className="font-medium">Arch. Marco Bianchi</div>
                        <div className="text-sm text-gray-500">arch.bianchi@example.com</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-purple-100 text-purple-800">Business</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">Attivo</Badge>
                    </TableCell>
                    <TableCell>22/04/2024</TableCell>
                    <TableCell>€59.99</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Pagamenti */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transazioni Recenti</CardTitle>
              <CardDescription>
                Monitoraggio di tutti i pagamenti e transazioni
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Transazione</TableHead>
                    <TableHead>Professionista</TableHead>
                    <TableHead>Piano</TableHead>
                    <TableHead>Importo</TableHead>
                    <TableHead>Metodo</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-sm">{transaction.id}</TableCell>
                      <TableCell>{transaction.professionalName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{transaction.planName}</Badge>
                      </TableCell>
                      <TableCell>€{transaction.amount}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-4 w-4 text-gray-400" />
                          <span className="capitalize">{transaction.paymentMethodType}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            transaction.status === "succeeded" ? "default" : 
                            transaction.status === "failed" ? "destructive" : 
                            "secondary"
                          }
                        >
                          {transaction.status === "succeeded" ? "Completato" : 
                           transaction.status === "failed" ? "Fallito" : 
                           "In sospeso"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(transaction.createdAt).toLocaleDateString('it-IT')}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {transaction.status === "succeeded" && (
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Report Finanziari */}
          <Card>
            <CardHeader>
              <CardTitle>Report Finanziari</CardTitle>
              <CardDescription>
                Analisi finanziarie e trend dei ricavi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium">Ricavi Ultimo Mese</h4>
                  <div className="text-2xl font-bold text-green-600">€0</div>
                  <div className="text-sm text-gray-600">0% variazione</div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Nuovi Abbonamenti</h4>
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-gray-600">0 vs mese precedente</div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Churn Rate</h4>
                  <div className="text-2xl font-bold text-orange-600">0%</div>
                  <div className="text-sm text-gray-600">Nessun dato</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Creazione Piano */}
      <Dialog open={isCreatePlanOpen} onOpenChange={setIsCreatePlanOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crea Nuovo Piano di Abbonamento</DialogTitle>
            <DialogDescription>
              Definisci un nuovo piano con funzionalità che migliorano l'esperienza professionale senza influenzare il ranking
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="planName">Nome Piano</Label>
                <Input id="planName" placeholder="es. Premium Plus" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="planPrice">Prezzo Mensile (€)</Label>
                <Input id="planPrice" type="number" placeholder="39.99" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="planDescription">Descrizione</Label>
              <Textarea id="planDescription" placeholder="Descrivi i vantaggi di questo piano..." />
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Funzionalità Incluse</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="unlimitedResponses" />
                  <Label htmlFor="unlimitedResponses">Risposte illimitate</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="advancedAnalytics" />
                  <Label htmlFor="advancedAnalytics">Analytics avanzate</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="dataExport" />
                  <Label htmlFor="dataExport">Esportazione dati</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="prioritySupport" />
                  <Label htmlFor="prioritySupport">Supporto prioritario</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="apiAccess" />
                  <Label htmlFor="apiAccess">Accesso API</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="multipleAccounts" />
                  <Label htmlFor="multipleAccounts">Account multipli</Label>
                </div>
              </div>
            </div>

            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <strong>Importante:</strong> Assicurati che nessuna funzionalità influenzi il posizionamento nei risultati di ricerca. 
                    Wolfinder mantiene la meritocrazia separando completamente abbonamenti e ranking.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatePlanOpen(false)}>
              Annulla
            </Button>
            <Button onClick={() => {/* Implement plan creation */}}>
              Crea Piano
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}