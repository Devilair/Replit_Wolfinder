import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import AdminLayout from "@/components/admin-layout";
import { Badge } from "@/components/ui/badge";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  count: number;
}

export default function AdminCategories() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [newCategory, setNewCategory] = useState({ name: "", slug: "" });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const createMutation = useMutation({
    mutationFn: async (categoryData: any) => {
      await apiRequest("POST", "/api/categories", categoryData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setIsCreateDialogOpen(false);
      setNewCategory({ name: "", slug: "" });
      toast({
        title: "Successo",
        description: "Categoria creata con successo",
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Errore nella creazione della categoria",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest("PATCH", `/api/admin/categories/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setEditingCategory(null);
      toast({
        title: "Successo",
        description: "Categoria aggiornata con successo",
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento della categoria",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Successo",
        description: "Categoria eliminata con successo",
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Errore nell'eliminazione della categoria",
        variant: "destructive",
      });
    },
  });

  const handleCreateCategory = () => {
    if (!newCategory.name || !newCategory.slug) {
      toast({
        title: "Errore",
        description: "Nome e slug sono obbligatori",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(newCategory);
  };

  const handleUpdateCategory = () => {
    if (!editingCategory.name || !editingCategory.slug) {
      toast({
        title: "Errore",
        description: "Nome e slug sono obbligatori",
        variant: "destructive",
      });
      return;
    }
    updateMutation.mutate({
      id: editingCategory.id,
      data: { name: editingCategory.name, slug: editingCategory.slug },
    });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[àáâãäå]/g, "a")
      .replace(/[èéêë]/g, "e")
      .replace(/[ìíîï]/g, "i")
      .replace(/[òóôõö]/g, "o")
      .replace(/[ùúûü]/g, "u")
      .replace(/[ç]/g, "c")
      .replace(/[ñ]/g, "n")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestione Categorie</h1>
          <p className="text-gray-600 mt-2">Gestisci le categorie professionali della piattaforma</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crea Nuova Categoria</DialogTitle>
              <DialogDescription>
                Aggiungi una nuova categoria professionale alla piattaforma
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Categoria</Label>
                <Input
                  id="name"
                  value={newCategory.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setNewCategory({
                      name,
                      slug: generateSlug(name),
                    });
                  }}
                  placeholder="Es. Avvocato"
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={newCategory.slug}
                  onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                  placeholder="Es. avvocato"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Annulla
              </Button>
              <Button onClick={handleCreateCategory} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creazione..." : "Crea Categoria"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Categorie ({categories.length})</CardTitle>
          <CardDescription>
            Elenco delle categorie professionali disponibili
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Professionisti</TableHead>
                <TableHead>Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category: any) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-gray-600">{category.slug}</TableCell>
                  <TableCell>{category.count || 0}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Dialog
                        open={editingCategory?.id === category.id}
                        onOpenChange={(open) => {
                          if (open) {
                            setEditingCategory({ ...category });
                          } else {
                            setEditingCategory(null);
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Modifica Categoria</DialogTitle>
                            <DialogDescription>
                              Modifica i dettagli della categoria
                            </DialogDescription>
                          </DialogHeader>
                          {editingCategory && (
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="edit-name">Nome Categoria</Label>
                                <Input
                                  id="edit-name"
                                  value={editingCategory.name}
                                  onChange={(e) => {
                                    const name = e.target.value;
                                    setEditingCategory({
                                      ...editingCategory,
                                      name,
                                      slug: generateSlug(name),
                                    });
                                  }}
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-slug">Slug</Label>
                                <Input
                                  id="edit-slug"
                                  value={editingCategory.slug}
                                  onChange={(e) =>
                                    setEditingCategory({ ...editingCategory, slug: e.target.value })
                                  }
                                />
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingCategory(null)}>
                              Annulla
                            </Button>
                            <Button onClick={handleUpdateCategory} disabled={updateMutation.isPending}>
                              {updateMutation.isPending ? "Aggiornamento..." : "Aggiorna"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteMutation.mutate(category.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {categories.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nessuna categoria trovata
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}