import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Offline - NBA Projections",
  description: "You are currently offline",
};

export default function OfflinePage() {
  return (
    <div className="container flex items-center justify-center min-h-[80vh]">
      <Card className="mx-auto max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-muted p-3 rounded-full">
              <WifiOff className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">You're Offline</CardTitle>
          <CardDescription>
            Your device is currently not connected to the internet.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Some features and content may not be available until you reconnect.
            You can still view cached content and previously loaded data.
          </p>
          
          <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground">
            <p>Try the following:</p>
            <ul className="list-disc pl-5 mt-2 text-left">
              <li>Check your internet connection</li>
              <li>Verify your Wi-Fi or mobile data is turned on</li>
              <li>Try refreshing the page when connected</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between flex-wrap gap-3">
          <Button variant="outline" onClick={() => window.location.reload()} className="flex-1">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Link href="/" className="flex-1">
            <Button className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
} 