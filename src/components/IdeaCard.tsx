import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatDistanceToNow } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { Idea } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Edit3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface IdeaCardProps {
  idea: Idea;
  onClick: () => void;
  onUpdate?: () => void;
  isDragEnabled?: boolean;
}

export function IdeaCard({ idea, onClick, onUpdate, isDragEnabled = true }: IdeaCardProps) {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [isLiking, setIsLiking] = useState(false);
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

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user || isLiking) return;

    setIsLiking(true);
    try {
      if (idea.user_has_voted) {
        // Remove vote
        const { error } = await supabase
          .from('votes')
          .delete()
          .eq('user_id', user.id)
          .eq('idea_id', idea.id);

        if (error) throw error;
        
        toast({
          title: t('toast.vote.removed'),
          description: t('toast.vote.removed')
        });
      } else {
        // Add vote
        const { error } = await supabase
          .from('votes')
          .insert({
            user_id: user.id,
            idea_id: idea.id
          });

        if (error) throw error;
        
        toast({
          title: t('toast.vote.added'),
          description: t('toast.vote.added')
        });
      }

      // Refresh data
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error handling vote:', error);
      toast({
        title: t('toast.vote.error'),
        description: t('toast.vote.error'),
        variant: "destructive"
      });
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isDragEnabled ? attributes : {})}
      {...(isDragEnabled ? listeners : {})}
      className={`cursor-pointer transition-all duration-200 ${
        isDragEnabled && isDragging ? 'opacity-50 scale-95' : 'hover:scale-105'
      } ${!isDragEnabled ? 'cursor-default' : ''}`}
      onClick={onClick}
    >
      <div 
        className="bg-card rounded-lg border border-border/20 p-4 space-y-3 group"
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
              className="h-7 w-7 p-0 opacity-60 group-hover:opacity-100 hover:bg-primary/10 transition-all duration-200 shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              title={t('card.edit.title')}
            >
              <Edit3 className="h-3.5 w-3.5" />
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
              locale: language === 'pt-BR' ? ptBR : enUS
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
              onClick={handleLike}
              disabled={isLiking}
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
              {t('card.creator')}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}