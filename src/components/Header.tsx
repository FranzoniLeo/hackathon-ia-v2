import { useState } from 'react';
import { Search, Filter, LogOut, User, RefreshCw, Move, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useLanguage } from '@/contexts/LanguageContext';
import { Column } from '@/types';

interface HeaderProps {
  columns: Column[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedColumn: string | null;
  setSelectedColumn: (columnId: string | null) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  isDragEnabled: boolean;
  setIsDragEnabled: (enabled: boolean) => void;
}

export function Header({ 
  columns, 
  searchQuery, 
  setSearchQuery, 
  selectedColumn, 
  setSelectedColumn,
  onRefresh,
  isRefreshing = false,
  isDragEnabled,
  setIsDragEnabled
}: HeaderProps) {
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const { language, setLanguage, t, translateColumnName } = useLanguage();
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
            {t('header.title')}
          </h1>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4 flex-1 max-w-md mx-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={t('header.search.placeholder')}
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
              <SelectValue placeholder={t('header.filter.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('header.filter.all')}</SelectItem>
              {columns.map(column => (
                <SelectItem key={column.id} value={column.id}>
                  {translateColumnName(column.name)}
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
            title={t('header.refresh.title')}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-muted/20 rounded-lg border h-10">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <Select value={language} onValueChange={(value) => setLanguage(value as 'pt-BR' | 'en')}>
              <SelectTrigger className="w-16 h-6 border-0 bg-transparent shadow-none p-0 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt-BR">PT</SelectItem>
                <SelectItem value="en">EN</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Drag Toggle */}
          <div className="flex items-center space-x-3 px-4 py-2 bg-muted/20 rounded-lg border h-10">
            <Move className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              {t('header.drag.toggle')}
            </span>
            <Switch
              checked={isDragEnabled}
              onCheckedChange={setIsDragEnabled}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{profile?.name || t('header.user.default')}</span>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSignOut}
            className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {t('header.user.logout')}
          </Button>
        </div>
      </div>
    </header>
  );
}