import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Idea } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Edit3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface IdeaCardProps {
  idea: Idea;
  onClick: () => void;
}

export function IdeaCard({ idea, onClick }: IdeaCardProps) {
  const { user } = useAuth();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: idea.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isCreator = user?.id === idea.creator_id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-pointer transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-95' : 'hover:scale-105'
      }`}
      onClick={onClick}
    >
      <div 
        className="bg-card rounded-lg border border-border/20 p-4 space-y-3"
        style={{
          background: 'var(--gradient-card)',
          boxShadow: 'var(--shadow-card)',
          transition: 'var(--transition-smooth)'
        }}
      >
        {/* Title and Edit Button */}
        <div className="flex items-start justify-between">
          <h4 className="font-semibold text-sm leading-tight flex-1 pr-2">
            {idea.title}
          </h4>
          {isCreator && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              <Edit3 className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Description */}
        {idea.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {idea.description.length > 80 
              ? `${idea.description.substring(0, 80)}...` 
              : idea.description
            }
          </p>
        )}

        {/* Creator and Date */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-medium">{idea.creator?.name}</span>
          <span>
            {formatDistanceToNow(new Date(idea.created_at), { 
              addSuffix: true, 
              locale: ptBR 
            })}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/20">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className={`h-6 px-2 text-xs ${
                idea.user_has_voted 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'text-muted-foreground hover:text-red-500'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                // Will be handled in the modal
              }}
            >
              <Heart className={`h-3 w-3 mr-1 ${idea.user_has_voted ? 'fill-current' : ''}`} />
              {idea.vote_count || 0}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              {idea.comment_count || 0}
            </Button>
          </div>
          
          {isCreator && (
            <Badge variant="outline" className="text-xs">
              Criador
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}