import { useState } from 'react';
import { Search, Filter, LogOut, User, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Column } from '@/types';

interface HeaderProps {
  columns: Column[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedColumn: string | null;
  setSelectedColumn: (columnId: string | null) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function Header({ 
  columns, 
  searchQuery, 
  setSearchQuery, 
  selectedColumn, 
  setSelectedColumn,
  onRefresh,
  isRefreshing = false
}: HeaderProps) {
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const [searchFocused, setSearchFocused] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="border-b border-border/20 bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <h1 
            className="text-2xl font-bold"
            style={{
              background: 'var(--gradient-primary)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Kanban Board
          </h1>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4 flex-1 max-w-md mx-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar ideias..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className={`pl-10 transition-all duration-300 ${
                searchFocused ? 'ring-2 ring-primary/20' : ''
              }`}
            />
          </div>
          
          <Select value={selectedColumn || 'all'} onValueChange={(value) => setSelectedColumn(value === 'all' ? null : value)}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as colunas</SelectItem>
              {columns.map(column => (
                <SelectItem key={column.id} value={column.id}>
                  {column.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="hover:bg-primary/10 hover:text-primary hover:border-primary/20"
            title="Atualizar dados do board"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{profile?.name || 'Usuário'}</span>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSignOut}
            className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}