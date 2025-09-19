import { useState, useEffect, useRef } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { supabase } from '@/integrations/supabase/client';
import { Column as ColumnType, Idea } from '@/types';
import { KanbanColumn } from './KanbanColumn';
import { IdeaCard } from './IdeaCard';
import { CreateIdeaModal } from './CreateIdeaModal';
import { IdeaDetailModal } from './IdeaDetailModal';
import { Header } from './Header';
import { ScrollSyncFooter } from './ScrollSyncFooter';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function KanbanBoard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [draggedIdea, setDraggedIdea] = useState<Idea | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
    setupRealtime();
  }, []);

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      // Fetch columns
      const { data: columnsData, error: columnsError } = await supabase
        .from('columns')
        .select('*')
        .order('position');

      if (columnsError) throw columnsError;
      setColumns(columnsData || []);

      // Fetch ideas with related data
      const { data: ideasData, error: ideasError } = await supabase
        .from('ideas')
        .select(`
          *,
          creator:profiles!creator_id(*),
          votes(id, user_id, idea_id, created_at),
          comments(id, idea_id, created_at)
        `)
        .order('position_in_column');

      if (ideasError) throw ideasError;

      // Process ideas to add computed fields
      const processedIdeas = (ideasData || []).map((idea: any) => ({
        ...idea,
        vote_count: idea.votes?.length || 0,
        comment_count: idea.comments?.length || 0,
        user_has_voted: idea.votes?.some((vote: any) => vote.user_id === user?.id) || false
      }));

      setIdeas(processedIdeas);

      if (isRefresh) {
        toast({
          title: "Board atualizado",
          description: "Os dados foram atualizados com sucesso!",
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do board.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const refreshBoard = async () => {
    await fetchData(true);
  };

  const setupRealtime = () => {
    const channel = supabase
      .channel('kanban-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'ideas'
      }, () => {
        fetchData();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'votes'
      }, () => {
        fetchData();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comments'
      }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleDragStart = (event: DragStartEvent) => {
    const idea = ideas.find(i => i.id === event.active.id);
    setDraggedIdea(idea || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedIdea(null);

    if (!over) {
      console.log('No drop target found');
      return;
    }

    const ideaId = active.id as string;
    
    // Find the idea being moved
    const idea = ideas.find(i => i.id === ideaId);
    if (!idea) {
      console.error('Idea not found:', ideaId);
      return;
    }

    // Determine target column ID
    let targetColumnId: string;
    
    // Check if we're dropping on a column directly
    const isDroppingOnColumn = columns.some(col => col.id === over.id);
    
    if (isDroppingOnColumn) {
      // Dropping directly on column
      targetColumnId = over.id as string;
    } else {
      // Dropping on another card - find which column that card belongs to
      const targetIdea = ideas.find(i => i.id === over.id);
      if (!targetIdea) {
        console.error('Target idea not found:', over.id);
        return;
      }
      targetColumnId = targetIdea.column_id;
    }

    console.log('Moving idea:', {
      ideaId,
      fromColumn: idea.column_id,
      toColumn: targetColumnId,
      isDroppingOnColumn,
      overId: over.id
    });

    // If dropping in the same column, no change needed
    if (idea.column_id === targetColumnId) {
      console.log('Same column, no change needed');
      return;
    }

    try {
      // Calculate new position (append to end of target column)
      const targetColumnIdeas = ideas.filter(i => i.column_id === targetColumnId);
      const newPosition = targetColumnIdeas.length;

      console.log('Updating idea position:', {
        ideaId,
        newColumnId: targetColumnId,
        newPosition,
        targetColumnIdeasCount: targetColumnIdeas.length
      });

      // Update the idea in the database
      const { error } = await supabase
        .from('ideas')
        .update({
          column_id: targetColumnId,
          position_in_column: newPosition
        })
        .eq('id', ideaId);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Idea moved successfully');
      toast({
        title: "Ideia movida",
        description: "A ideia foi movida com sucesso!"
      });
    } catch (error) {
      console.error('Error moving idea:', error);
      toast({
        title: "Erro ao mover ideia",
        description: "Não foi possível mover a ideia. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = !searchQuery || 
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (idea.description && idea.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesColumn = !selectedColumn || idea.column_id === selectedColumn;
    
    return matchesSearch && matchesColumn;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        columns={columns}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedColumn={selectedColumn}
        setSelectedColumn={setSelectedColumn}
        onRefresh={refreshBoard}
        isRefreshing={isRefreshing}
      />
      
      <div className="kanban-scroll-wrapper">
        <main className="container mx-auto px-4 py-6 h-full">
          <DndContext
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div 
              ref={contentRef}
              className="kanban-scroll-content"
            >
              <div className="flex gap-6 min-w-max py-6">
                <SortableContext 
                  items={columns.map(col => col.id)} 
                  strategy={horizontalListSortingStrategy}
                >
                  {columns.map(column => (
                    <KanbanColumn
                      key={column.id}
                      column={column}
                      ideas={filteredIdeas.filter(idea => idea.column_id === column.id)}
                      onIdeaClick={setSelectedIdea}
                    />
                  ))}
                </SortableContext>
              </div>
            </div>
            
            <DragOverlay>
              {draggedIdea && <IdeaCard idea={draggedIdea} onClick={() => {}} />}
            </DragOverlay>
          </DndContext>
        </main>
      </div>

      {/* Barra de scroll horizontal no footer */}
      <ScrollSyncFooter contentRef={contentRef} />

      {/* Floating Action Button */}
      <Button
        onClick={() => setCreateModalOpen(true)}
        className="fixed bottom-12 right-10 h-14 w-14 rounded-full shadow-lg z-20"
        style={{
          background: 'var(--gradient-primary)',
          boxShadow: 'var(--shadow-kanban)'
        }}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Modals */}
      <CreateIdeaModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        columns={columns}
      />
      
      {selectedIdea && (
        <IdeaDetailModal
          idea={selectedIdea}
          onClose={() => setSelectedIdea(null)}
          onUpdate={fetchData}
        />
      )}
    </div>
  );
}