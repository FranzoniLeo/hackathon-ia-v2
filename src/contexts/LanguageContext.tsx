import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'pt-BR' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  translateColumnName: (columnName: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('kanban-language');
    return (saved as Language) || 'pt-BR';
  });

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('kanban-language', newLanguage);
  };

  // Function to translate column names
  const translateColumnName = (columnName: string): string => {
    const columnTranslations: Record<string, string> = {
      'Ideas': t('column.ideas'),
      'Em Progresso': t('column.in.progress'),
      'Concluído': t('column.completed'),
      'Backlog': t('column.backlog'),
      'Em Análise': t('column.in.analysis'),
      'Aprovado': t('column.approved'),
      'Em Desenvolvimento': t('column.in.development'),
    };
    
    return columnTranslations[columnName] || columnName;
  };

  // Translation function
  const t = (key: string): string => {
    const translations = {
      'pt-BR': {
        // Header
        'header.title': 'Kanban Board',
        'header.search.placeholder': 'Buscar ideias...',
        'header.filter.placeholder': 'Filtrar',
        'header.filter.all': 'Todas as colunas',
        'header.refresh.title': 'Atualizar dados do board',
        'header.drag.toggle': 'Movimentação dos cards',
        'header.user.default': 'Usuário',
        'header.user.logout': 'Sair',
        
        // Auth
        'auth.signin.title': 'Entrar',
        'auth.signup.title': 'Criar conta',
        'auth.email': 'Email',
        'auth.password': 'Senha',
        'auth.name': 'Nome',
        'auth.signin.button': 'Entrar',
        'auth.signup.button': 'Criar conta',
        'auth.forgot.password': 'Esqueceu a senha?',
        'auth.no.account': 'Não tem uma conta?',
        'auth.has.account': 'Já tem uma conta?',
        'auth.signup.link': 'Criar conta',
        'auth.signin.link': 'Entrar',
        
        // Cards
        'card.creator': 'Criador',
        'card.edit.title': 'Editar card',
        'card.no.ideas': 'Nenhuma ideia ainda',
        'card.likes': 'likes',
        'card.comments': 'comentários',
        
        // Modal
        'modal.idea.title': 'Detalhes da Ideia',
        'modal.idea.edit': 'Editar',
        'modal.idea.delete': 'Excluir',
        'modal.idea.cancel': 'Cancelar',
        'modal.idea.save': 'Salvar',
        'modal.idea.created.by': 'Criado por:',
        'modal.idea.votes': 'votos',
        'modal.idea.comments': 'comentários',
        'modal.idea.comment.placeholder': 'Escreva um comentário...',
        'modal.idea.comment.edit': 'Editar comentário',
        'modal.idea.comment.delete': 'Excluir comentário',
        'modal.idea.comment.no.comments': 'Nenhum comentário ainda. Seja o primeiro a comentar!',
        'modal.idea.delete.confirm': 'Tem certeza que deseja excluir esta ideia?',
        'modal.idea.comment.delete.confirm': 'Tem certeza que deseja excluir este comentário?',
        
        // Notifications
        'toast.vote.added': 'Voto adicionado',
        'toast.vote.removed': 'Voto removido',
        'toast.comment.added': 'Comentário adicionado',
        'toast.comment.updated': 'Comentário atualizado',
        'toast.comment.deleted': 'Comentário excluído',
        'toast.idea.updated': 'Ideia atualizada',
        'toast.idea.deleted': 'Ideia excluída',
        'toast.login.success': 'Login realizado com sucesso!',
        'toast.login.error': 'Erro no login',
        'toast.signup.success': 'Conta criada com sucesso!',
        'toast.signup.error': 'Erro ao criar conta',
        'toast.vote.error': 'Erro ao votar',
        'toast.comment.error': 'Erro ao comentar',
        'toast.edit.error': 'Erro ao editar',
        'toast.delete.error': 'Erro ao excluir',
        'toast.update.error': 'Erro ao atualizar',
        'toast.unexpected.error': 'Erro inesperado',
        
        // Columns
        'column.ideas': 'Ideias',
        'column.in.progress': 'Em Progresso',
        'column.completed': 'Concluído',
        'column.backlog': 'Backlog',
        'column.in.analysis': 'Em Análise',
        'column.approved': 'Aprovado',
        'column.in.development': 'Em Desenvolvimento',
        
        // Common
        'common.loading': 'Carregando...',
        'common.error': 'Erro',
        'common.success': 'Sucesso',
        'common.cancel': 'Cancelar',
        'common.save': 'Salvar',
        'common.edit': 'Editar',
        'common.delete': 'Excluir',
        'common.confirm': 'Confirmar',
        'common.close': 'Fechar',
      },
      'en': {
        // Header
        'header.title': 'Kanban Board',
        'header.search.placeholder': 'Search ideas...',
        'header.filter.placeholder': 'Filter',
        'header.filter.all': 'All columns',
        'header.refresh.title': 'Refresh board data',
        'header.drag.toggle': 'Card movement',
        'header.user.default': 'User',
        'header.user.logout': 'Logout',
        
        // Auth
        'auth.signin.title': 'Sign In',
        'auth.signup.title': 'Sign Up',
        'auth.email': 'Email',
        'auth.password': 'Password',
        'auth.name': 'Name',
        'auth.signin.button': 'Sign In',
        'auth.signup.button': 'Sign Up',
        'auth.forgot.password': 'Forgot password?',
        'auth.no.account': "Don't have an account?",
        'auth.has.account': 'Already have an account?',
        'auth.signup.link': 'Sign up',
        'auth.signin.link': 'Sign in',
        
        // Cards
        'card.creator': 'Creator',
        'card.edit.title': 'Edit card',
        'card.no.ideas': 'No ideas yet',
        'card.likes': 'likes',
        'card.comments': 'comments',
        
        // Modal
        'modal.idea.title': 'Idea Details',
        'modal.idea.edit': 'Edit',
        'modal.idea.delete': 'Delete',
        'modal.idea.cancel': 'Cancel',
        'modal.idea.save': 'Save',
        'modal.idea.created.by': 'Created by:',
        'modal.idea.votes': 'votes',
        'modal.idea.comments': 'comments',
        'modal.idea.comment.placeholder': 'Write a comment...',
        'modal.idea.comment.edit': 'Edit comment',
        'modal.idea.comment.delete': 'Delete comment',
        'modal.idea.comment.no.comments': 'No comments yet. Be the first to comment!',
        'modal.idea.delete.confirm': 'Are you sure you want to delete this idea?',
        'modal.idea.comment.delete.confirm': 'Are you sure you want to delete this comment?',
        
        // Notifications
        'toast.vote.added': 'Vote added',
        'toast.vote.removed': 'Vote removed',
        'toast.comment.added': 'Comment added',
        'toast.comment.updated': 'Comment updated',
        'toast.comment.deleted': 'Comment deleted',
        'toast.idea.updated': 'Idea updated',
        'toast.idea.deleted': 'Idea deleted',
        'toast.login.success': 'Login successful!',
        'toast.login.error': 'Login error',
        'toast.signup.success': 'Account created successfully!',
        'toast.signup.error': 'Error creating account',
        'toast.vote.error': 'Error voting',
        'toast.comment.error': 'Error commenting',
        'toast.edit.error': 'Error editing',
        'toast.delete.error': 'Error deleting',
        'toast.update.error': 'Error updating',
        'toast.unexpected.error': 'Unexpected error',
        
        // Columns
        'column.ideas': 'Ideas',
        'column.in.progress': 'In Progress',
        'column.completed': 'Completed',
        'column.backlog': 'Backlog',
        'column.in.analysis': 'In Analysis',
        'column.approved': 'Approved',
        'column.in.development': 'In Development',
        
        // Common
        'common.loading': 'Loading...',
        'common.error': 'Error',
        'common.success': 'Success',
        'common.cancel': 'Cancel',
        'common.save': 'Save',
        'common.edit': 'Edit',
        'common.delete': 'Delete',
        'common.confirm': 'Confirm',
        'common.close': 'Close',
      }
    };

    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translateColumnName }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
