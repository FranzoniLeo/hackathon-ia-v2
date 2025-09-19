import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column, Idea } from '@/types';
import { IdeaCard } from './IdeaCard';
import { Badge } from '@/components/ui/badge';

interface KanbanColumnProps {
  column: Column;
  ideas: Idea[];
  onIdeaClick: (idea: Idea) => void;
  onUpdate?: () => void;
  isDragEnabled?: boolean;
}

export function KanbanColumn({ column, ideas, onIdeaClick, onUpdate, isDragEnabled = true }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div 
      className={`min-w-80 max-w-80 transition-all duration-200 ${
        isOver ? 'scale-105' : ''
      }`}
    >
      <div 
        className="bg-card/50 rounded-lg border border-border/20 p-4 backdrop-blur-sm"
        style={{
          background: 'var(--gradient-card)',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        {/* Column Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: column.color }}
            />
            <h3 className="font-semibold text-lg">{column.name}</h3>
          </div>
          <Badge variant="secondary" className="text-xs">
            {ideas.length}
          </Badge>
        </div>

        {/* Ideas Container */}
        <div
          ref={setNodeRef}
          className={`min-h-32 space-y-3 transition-all duration-200 ${
            isOver ? 'bg-primary/5 border-2 border-dashed border-primary/30 rounded-lg p-2' : ''
          }`}
        >
          <SortableContext 
            items={ideas.map(idea => idea.id)} 
            strategy={verticalListSortingStrategy}
          >
            {ideas.map(idea => (
              <IdeaCard 
                key={idea.id} 
                idea={idea} 
                onClick={() => onIdeaClick(idea)}
                onUpdate={onUpdate}
                isDragEnabled={isDragEnabled}
              />
            ))}
          </SortableContext>
          
          {ideas.length === 0 && !isOver && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Nenhuma ideia ainda
            </div>
          )}
        </div>
      </div>
    </div>
  );
}