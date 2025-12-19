// src/pages/Login.tsx
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function Login() {
  const navigate = useNavigate();

  const handleGuestLogin = () => {
    // Simply navigate to the dashboard root
    navigate('/');
  };

  return (
    <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Card className="w-[400px] shadow-xl border-t-4 border-t-primary">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Bharat Explorer</CardTitle>
          <p className="text-sm text-muted-foreground">Internal LLF SMT Dashboard</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              Click below to access the dashboard directly.
            </p>
            <Button 
              onClick={handleGuestLogin} 
              className="w-full font-bold py-6 text-lg"
            >
              Enter Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}