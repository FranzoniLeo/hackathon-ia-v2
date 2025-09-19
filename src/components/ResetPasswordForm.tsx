import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2, KeyRound } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ResetPasswordFormProps {
  onComplete: () => void;
}

export function ResetPasswordForm({ onComplete }: ResetPasswordFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasValidTokens, setHasValidTokens] = useState(false);
  
  const [passwords, setPasswords] = useState({
    password: '',
    confirmPassword: ''
  });

  // Check for password reset tokens in URL
  useEffect(() => {
    console.log('🔍 ResetPasswordForm: Checking for tokens in URL');
    console.log('📍 Current URL:', window.location.href);
    
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    
    console.log('🔍 Type:', type);
    console.log('🎫 Access Token:', accessToken ? 'Present' : 'Missing');
    console.log('🎫 Refresh Token:', refreshToken ? 'Present' : 'Missing');
    
    if (type === 'recovery') {
      console.log('✅ Valid password reset request found');
      
      // Store tokens for use in password update (if present)
      if (accessToken) sessionStorage.setItem('reset_access_token', accessToken);
      if (refreshToken) sessionStorage.setItem('reset_refresh_token', refreshToken);
      
      // Store the recovery token which is the most important
      const token = urlParams.get('token');
      if (token) {
        sessionStorage.setItem('reset_token', token);
        console.log('💾 Stored recovery token');
      }
      
      setHasValidTokens(true);
      
      // Clean URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      
      toast({
        title: "Link de reset válido",
        description: "Digite sua nova senha abaixo.",
        duration: 5000,
      });
    } else {
      console.log('❌ No valid reset tokens found');
      toast({
        title: "Link inválido",
        description: "Este link de reset é inválido ou já foi usado.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwords.password !== passwords.confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "Por favor, digite a mesma senha nos dois campos.",
        variant: "destructive"
      });
      return;
    }

    if (passwords.password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Get stored tokens from password reset link
      const accessToken = sessionStorage.getItem('reset_access_token');
      const refreshToken = sessionStorage.getItem('reset_refresh_token');
      const resetToken = sessionStorage.getItem('reset_token');
      
      console.log('🔍 Available tokens:');
      console.log('Access Token:', accessToken ? 'Present' : 'Missing');
      console.log('Refresh Token:', refreshToken ? 'Present' : 'Missing');
      console.log('Reset Token:', resetToken ? 'Present' : 'Missing');

      // CRITICAL: We need to authenticate first using the reset tokens
      if (accessToken && refreshToken) {
        console.log('🔑 Setting session with reset tokens...');
        
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (sessionError) {
          console.error('Session error:', sessionError);
          toast({
            title: "Erro de autenticação",
            description: "Tokens de reset inválidos ou expirados.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        } else {
          console.log('✅ Session set successfully with user:', data.user?.email);
        }
      } else {
        // If no tokens, try to use the session that might be implicitly created by Supabase
        console.log('⚠️ No access/refresh tokens, checking current session...');
        const { data: session } = await supabase.auth.getSession();
        
        if (!session.session) {
          // Last resort: try to exchange the reset token
          const resetToken = sessionStorage.getItem('reset_token');
          if (resetToken) {
            console.log('🔄 Attempting to verify reset token...');
            
            // Use the verifyOtp method for password recovery
            const { data, error: verifyError } = await supabase.auth.verifyOtp({
              token_hash: resetToken,
              type: 'recovery'
            });
            
            if (verifyError) {
              console.error('Token verification error:', verifyError);
              toast({
                title: "Token inválido",
                description: "O link de reset de senha expirou ou é inválido.",
                variant: "destructive"
              });
              setLoading(false);
              return;
            } else {
              console.log('✅ Token verified, session created:', data.user?.email);
            }
          } else {
            console.error('No reset token available');
            toast({
              title: "Erro de autenticação",
              description: "Sessão de reset não encontrada.",
              variant: "destructive"
            });
            setLoading(false);
            return;
          }
        } else {
          console.log('✅ Existing session found:', session.session.user.email);
        }
      }

      // Now update the password
      console.log('🔐 Attempting to update password...');
      const { error } = await supabase.auth.updateUser({
        password: passwords.password
      });

      if (error) {
        console.error('Password update error:', error);
        toast({
          title: "Erro ao redefinir senha",
          description: error.message,
          variant: "destructive"
        });
      } else {
        // Clear all stored tokens
        sessionStorage.removeItem('reset_access_token');
        sessionStorage.removeItem('reset_refresh_token');
        sessionStorage.removeItem('reset_token');
        sessionStorage.removeItem('is_password_reset');
        
        console.log('✅ Password updated successfully');
        
        toast({
          title: "Senha redefinida com sucesso!",
          description: "Sua senha foi alterada. Você será redirecionado para o login.",
        });
        
        // Redirect to login page after success
        setTimeout(() => {
          onComplete();
        }, 2000);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao redefinir a senha. Tente novamente.",
        variant: "destructive"
      });
    }

    setLoading(false);
  };

  // Show loading or error state if no valid tokens
  if (!hasValidTokens) {
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
              <CardTitle className="text-2xl font-bold text-destructive">
                Link Inválido
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Este link de reset de senha é inválido, expirado ou já foi usado.
              </p>
              <Button 
                onClick={() => window.location.href = '/auth'}
                variant="outline"
              >
                Voltar para Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <KeyRound className="h-6 w-6 text-primary" />
            </div>
            <CardTitle 
              className="text-2xl font-bold"
              style={{
                background: 'var(--gradient-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Redefinir Senha
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Digite sua nova senha abaixo
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua nova senha"
                    value={passwords.password}
                    onChange={(e) => setPasswords(prev => ({ ...prev, password: e.target.value }))}
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
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Digite novamente sua nova senha"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                Redefinir Senha
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
