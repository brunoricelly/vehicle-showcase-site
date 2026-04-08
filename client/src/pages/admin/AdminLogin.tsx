import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, LogIn } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";

export function AdminLogin() {
  const [, navigate] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();

  // Query to check if current user's email is authorized
  const { data: isAuthorized, isLoading: isCheckingAuth } = trpc.admin.isEmailAuthorized.useQuery(
    { email: user?.email || "" },
    { enabled: !!user?.email && !authLoading }
  );

  // Redirect if authorized
  useEffect(() => {
    if (isAuthorized && user) {
      navigate("/admin");
    }
  }, [isAuthorized, user, navigate]);

  // Show error if not authorized
  useEffect(() => {
    if (!authLoading && !isCheckingAuth && user && isAuthorized === false) {
      setError("Seu email não está autorizado para acessar o painel administrativo.");
    }
  }, [authLoading, isCheckingAuth, user, isAuthorized]);

  const handleGoogleLogin = () => {
    // Get login URL with return path to admin
    const loginUrl = getLoginUrl();
    window.location.href = loginUrl;
  };

  const getSearchParam = (param: string) => {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
  };

  // Show loading state
  if (authLoading || isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Carregando...</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Verificando suas credenciais...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Painel Administrativo</CardTitle>
          <CardDescription>Faça login com sua conta Google</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {!user ? (
              <>
                <Button
                  onClick={handleGoogleLogin}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Entrar com Google
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Apenas emails autorizados podem acessar o painel administrativo.
                </p>
              </>
            ) : (
              <>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Email: {user.email}</p>
                </div>
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    Voltar para Início
                  </Button>
                </Link>
              </>
            )}
          </div>

          {getSearchParam("unauthorized") && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Seu email não está autorizado para acessar o painel administrativo. Entre em contato com o administrador.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
