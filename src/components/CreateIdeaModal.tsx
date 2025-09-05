import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Column } from '@/types';
import { Loader2 } from 'lucide-react';

interface CreateIdeaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: Column[];
}

export function CreateIdeaModal({ open, onOpenChange, columns }: CreateIdeaModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    column_id: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.title.trim() || !formData.column_id) return;

    setLoading(true);

    try {
      // Get the count of ideas in the target column to set position
      const { data: columnIdeas, error: countError } = await supabase
        .from('ideas')
        .select('id')
        .eq('column_id', formData.column_id);

      if (countError) throw countError;

      const position = columnIdeas?.length || 0;

      const { error } = await supabase
        .from('ideas')
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          creator_id: user.id,
          column_id: formData.column_id,
          position_in_column: position
        });

      if (error) throw error;

      toast({
        title: "Ideia criada!",
        description: "Sua ideia foi adicionada ao board."
      });

      // Reset form and close modal
      setFormData({ title: '', description: '', column_id: '' });
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating idea:', error);
      toast({
        title: "Erro ao criar ideia",
        description: "Não foi possível criar a ideia. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Ideia</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Digite o título da ideia..."
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva sua ideia (opcional)..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="column">Coluna *</Label>
            <Select 
              value={formData.column_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, column_id: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma coluna..." />
              </SelectTrigger>
              <SelectContent>
                {columns.map(column => (
                  <SelectItem key={column.id} value={column.id}>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: column.color }}
                      />
                      <span>{column.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.title.trim() || !formData.column_id}
              style={{
                background: 'var(--gradient-primary)',
                transition: 'var(--transition-smooth)'
              }}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Criar Ideia
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}