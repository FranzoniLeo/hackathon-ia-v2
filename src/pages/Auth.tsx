import { useState, useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ForgotPasswordModal } from '@/components/ForgotPasswordModal';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

// CRITICAL: Intercept password reset BEFORE React renders
const isPasswordResetFromUrl = (() => {
  console.log('🚨 PRE-REACT EXECUTION - Auth.tsx loading...');
  
  if (typeof window === 'undefined') {
    console.log('❌ Window undefined (SSR)');
    return false;
  }
  
  const currentUrl = window.location.href;
  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get('type');
  const accessToken = urlParams.get('access_token');
  const refreshToken = urlParams.get('refresh_token');
  
  console.log('🚨 PRE-REACT Password Reset Check:');
  console.log('📍 Current URL:', currentUrl);
  console.log('🔍 Type param:', type);
  console.log('🎫 Access Token:', accessToken ? 'Present' : 'Missing');
  console.log('🎫 Refresh Token:', refreshToken ? 'Present' : 'Missing');
  console.log('📋 All params:', Object.fromEntries(urlParams.entries()));
  
  if (type === 'recovery') {
    console.log('✅ Recovery type detected - Auth.tsx will not interfere');
    // Don't clean URL here - let ResetPasswordForm handle it
    return false; // Let the normal routing handle /reset-password
  } else {
    console.log('❌ Not a recovery request - proceeding normally');
  }
  
  return false;
})();

export default function Auth() {
  // Normal auth component behavior
  const [searchParams] = useSearchParams();
  const [isPasswordReset, setIsPasswordReset] = useState(false);

  const { user, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });
  
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    name: ''
  });

  // Auth.tsx no longer handles password reset - that's handled by /reset-password route

  // Redirect if already authenticated (DEPOIS dos hooks)
  if (user) {
    console.log('👤 User authenticated, redirecting to dashboard:', user.email);
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await signIn(signInData.email, signInData.password);
      
      if (error) {
        toast({
          title: "Erro no login",
          description: error.message,
          variant: "destructive"
        });
        setLoading(false);
      } else {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta!"
        });
        // Não definir loading como false aqui, deixar o useAuth gerenciar
        // o redirecionamento acontecerá automaticamente quando user for atualizado
      }
    } catch (err) {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro durante o login. Tente novamente.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signUp(signUpData.email, signUpData.password, signUpData.name);
    
    if (error) {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Você já pode fazer login."
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div 
        className="w-full max-w-md"
        style={{
          background: 'var(--gradient-card)',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        <Card className="border-border/20 bg-transparent">
          <CardHeader className="text-center">
            <CardTitle 
              className="text-2xl font-bold"
              style={{
                background: 'var(--gradient-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Kanban Board
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Login</TabsTrigger>
                <TabsTrigger value="signup">Cadastro</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={signInData.email}
                      onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={signInData.password}
                        onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loading}
                    style={{
                      background: 'var(--gradient-primary)',
                      transition: 'var(--transition-smooth)'
                    }}
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Entrar
                  </Button>
                  
                  <div className="text-center">
                    <Button
                      type="button"
                      variant="link"
                      className="text-sm text-muted-foreground hover:text-primary"
                      onClick={() => setForgotPasswordOpen(true)}
                      disabled={loading}
                    >
                      Esqueci minha senha
                    </Button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nome</Label>
                    <Input
                      id="signup-name"
                      placeholder="Seu nome"
                      value={signUpData.name}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={signUpData.password}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loading}
                    style={{
                      background: 'var(--gradient-primary)',
                      transition: 'var(--transition-smooth)'
                    }}
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Cadastrar
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Modal de Esqueci Minha Senha */}
      <ForgotPasswordModal 
        open={forgotPasswordOpen}
        onOpenChange={setForgotPasswordOpen}
      />
    </div>
  );
}