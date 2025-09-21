import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Idea, Comment, Vote } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Heart, MessageCircle, Edit3, Trash2, Send, Loader2, Check, X } from 'lucide-react';

interface IdeaDetailModalProps {
  idea: Idea;
  onClose: () => void;
  onUpdate: () => void;
}

export function IdeaDetailModal({ idea, onClose, onUpdate }: IdeaDetailModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [editData, setEditData] = useState({
    title: idea.title,
    description: idea.description || ''
  });

  const isCreator = user?.id === idea.creator_id;
  const userHasVoted = votes.some(vote => vote.user_id === user?.id);

  useEffect(() => {
    fetchDetails();
  }, [idea.id]);

  const fetchDetails = async () => {
    try {
      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select(`
          *,
          user:profiles!user_id(*)
        `)
        .eq('idea_id', idea.id)
        .order('created_at');

      if (commentsError) throw commentsError;
      setComments(commentsData || []);

      // Fetch votes
      const { data: votesData, error: votesError } = await supabase
        .from('votes')
        .select(`
          *,
          user:profiles!user_id(*)
        `)
        .eq('idea_id', idea.id);

      if (votesError) throw votesError;
      setVotes(votesData || []);
    } catch (error) {
      console.error('Error fetching idea details:', error);
    }
  };

  const handleVote = async () => {
    if (!user) return;

    setLoading(true);
    try {
      if (userHasVoted) {
        // Remove vote
        const { error } = await supabase
          .from('votes')
          .delete()
          .eq('user_id', user.id)
          .eq('idea_id', idea.id);

        if (error) throw error;
        
        toast({
          title: "Voto removido",
          description: "Seu voto foi removido da ideia."
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
          title: "Voto adicionado",
          description: "Você votou nesta ideia!"
        });
      }

      fetchDetails();
      onUpdate();
    } catch (error) {
      console.error('Error handling vote:', error);
      toast({
        title: "Erro ao votar",
        description: "Não foi possível processar seu voto.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          content: newComment.trim(),
          user_id: user.id,
          idea_id: idea.id
        });

      if (error) throw error;

      setNewComment('');
      fetchDetails();
      onUpdate();
      
      toast({
        title: "Comentário adicionado",
        description: "Seu comentário foi adicionado com sucesso!"
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Erro ao comentar",
        description: "Não foi possível adicionar o comentário.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!isCreator || !editData.title.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('ideas')
        .update({
          title: editData.title.trim(),
          description: editData.description.trim() || null
        })
        .eq('id', idea.id);

      if (error) throw error;

      setEditing(false);
      onUpdate();
      
      toast({
        title: "Ideia atualizada",
        description: "As alterações foram salvas com sucesso!"
      });
    } catch (error) {
      console.error('Error updating idea:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isCreator) return;

    if (!confirm('Tem certeza que deseja excluir esta ideia?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('ideas')
        .delete()
        .eq('id', idea.id);

      if (error) throw error;

      onClose();
      onUpdate();
      
      toast({
        title: "Ideia excluída",
        description: "A ideia foi removida do board."
      });
    } catch (error) {
      console.error('Error deleting idea:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a ideia.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditCommentContent(comment.content);
  };

  const handleSaveCommentEdit = async (commentId: string) => {
    if (!editCommentContent.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('comments')
        .update({
          content: editCommentContent.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId);

      if (error) throw error;

      setEditingCommentId(null);
      setEditCommentContent('');
      fetchDetails();
      onUpdate();
      
      toast({
        title: "Comentário atualizado",
        description: "Seu comentário foi editado com sucesso!"
      });
    } catch (error) {
      console.error('Error updating comment:', error);
      toast({
        title: "Erro ao editar",
        description: "Não foi possível editar o comentário.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelCommentEdit = () => {
    setEditingCommentId(null);
    setEditCommentContent('');
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Tem certeza que deseja excluir este comentário?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      fetchDetails();
      onUpdate();
      
      toast({
        title: "Comentário excluído",
        description: "O comentário foi removido com sucesso!"
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o comentário.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between">
            {editing ? (
              <Input
                value={editData.title}
                onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                className="text-lg font-semibold"
              />
            ) : (
              <DialogTitle className="text-lg font-semibold pr-8">
                {idea.title}
              </DialogTitle>
            )}
            
            {isCreator && (
              <div className="flex space-x-1">
                {editing ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditing(false);
                        setEditData({ title: idea.title, description: idea.description || '' });
                      }}
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSaveEdit}
                      disabled={loading || !editData.title.trim()}
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Salvar
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditing(true)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDelete}
                      className="text-destructive hover:text-destructive"
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Description */}
          <div>
            {editing ? (
              <Textarea
                value={editData.description}
                onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição da ideia..."
                rows={3}
              />
            ) : (
              idea.description && (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {idea.description}
                </p>
              )
            )}
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span>
                <strong>Criado por:</strong> {idea.creator?.name}
              </span>
              <span>
                {formatDistanceToNow(new Date(idea.created_at), { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </span>
            </div>
            {isCreator && <Badge variant="outline">Criador</Badge>}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVote}
              disabled={loading}
              className={userHasVoted ? 'text-red-500 hover:text-red-600' : ''}
            >
              <Heart className={`h-4 w-4 mr-2 ${userHasVoted ? 'fill-current' : ''}`} />
              {votes.length} {votes.length === 1 ? 'voto' : 'votos'}
            </Button>
            
            <div className="flex items-center space-x-2 text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              <span>{comments.length} {comments.length === 1 ? 'comentário' : 'comentários'}</span>
            </div>
          </div>

          <Separator />

          {/* Comments Section */}
          <div className="space-y-4">
            <h4 className="font-semibold">Comentários</h4>
            
            {/* Add Comment */}
            <div className="flex space-x-2">
              <Textarea
                placeholder="Escreva um comentário..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
                className="flex-1"
              />
              <Button
                onClick={handleAddComment}
                disabled={loading || !newComment.trim()}
                size="sm"
                style={{
                  background: 'var(--gradient-primary)',
                }}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Comments List */}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {comments.map(comment => {
                const isCommentCreator = user?.id === comment.user_id;
                const isEditing = editingCommentId === comment.id;
                
                return (
                  <div key={comment.id} className="bg-muted/50 rounded-lg p-3 group">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium">{comment.user?.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </span>
                        {isCommentCreator && !isEditing && (
                          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-primary/10"
                              onClick={() => handleEditComment(comment)}
                              title="Editar comentário"
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-destructive/10 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteComment(comment.id)}
                              title="Excluir comentário"
                              disabled={loading}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {isEditing ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editCommentContent}
                          onChange={(e) => setEditCommentContent(e.target.value)}
                          rows={2}
                          className="text-sm"
                        />
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelCommentEdit}
                            disabled={loading}
                            className="h-7 px-2"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Cancelar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSaveCommentEdit(comment.id)}
                            disabled={loading || !editCommentContent.trim()}
                            className="h-7 px-2"
                          >
                            {loading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Check className="h-3 w-3 mr-1" />}
                            Salvar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                    )}
                  </div>
                );
              })}
              
              {comments.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Nenhum comentário ainda. Seja o primeiro a comentar!
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}