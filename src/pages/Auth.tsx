import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers, Info } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Layers className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl font-heading">Brain Weaver</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            This is a static GitHub Pages build. Notes live in your GitHub repo;
            settings are stored in your browser.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-secondary rounded-lg p-3">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>
              Cloud sync is not available in this build. To enable it, deploy with your own
              Supabase project and set <code className="font-mono">VITE_SUPABASE_URL</code> &amp;{' '}
              <code className="font-mono">VITE_SUPABASE_PUBLISHABLE_KEY</code>.
            </span>
          </div>
          <Button className="w-full gap-2" onClick={() => navigate('/')}>
            <Layers className="h-4 w-4" /> Open Command Center
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
