import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Map } from 'lucide-react';

export function MapLoadingSkeleton() {
  return (
    <Card className="flex flex-col min-h-[500px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="w-5 h-5" />
          Geometriya va Joylashuv
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 relative overflow-hidden rounded-b-lg">
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <div className="text-center space-y-2">
            <Map className="w-12 h-12 mx-auto text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Xarita yuklanmoqda...</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
