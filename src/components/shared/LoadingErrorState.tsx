// src/components/shared/LoadingErrorState.tsx
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface LoadingErrorStateProps {
  loading: boolean;
  error: string | null;
  dataLength: number;
  onRetry?: () => void;
}

export default function LoadingErrorState({ 
  loading, 
  error, 
  dataLength, 
  onRetry 
}: LoadingErrorStateProps) {
  // Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <div className="text-center">
          <p className="text-lg font-semibold">Loading Dashboard Data</p>
          <p className="text-sm text-muted-foreground">Please wait while we fetch your data...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh] p-6">
        <Alert variant="destructive" className="max-w-lg">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-bold">Error Loading Data</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">{error}</p>
            <div className="space-y-2 text-sm">
              <p className="font-semibold">Troubleshooting steps:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Check if the backend server is running on port 3000</li>
                <li>Verify your database connection</li>
                <li>Open browser console (F12) for detailed errors</li>
              </ul>
            </div>
            {onRetry && (
              <Button 
                onClick={onRetry} 
                variant="outline" 
                className="mt-4 w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Empty Data State
  if (dataLength === 0 && !loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center max-w-md">
          <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">No Data Found</h3>
          <p className="text-muted-foreground mb-4">
            No records match your current filters. Try adjusting your search criteria.
          </p>
          {onRetry && (
            <Button 
              onClick={onRetry} 
              variant="outline"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>
    );
  }

  return null;
}