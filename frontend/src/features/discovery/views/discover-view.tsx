import { useState } from "react";
import { Badge } from "@/shared/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/ui/tabs";
import { Brain, Music, Sparkles } from "lucide-react";
import DiscoveryList from "@/features/discovery/components/discovery-list";
import EnhancedDiscoveryList from "@/features/discovery/components/enhanced-discovery-list";

export function DiscoverView() {
  const [activeTab, setActiveTab] = useState("standard");

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
            <Music className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60">
              Music Discovery
            </h1>
            <p className="text-muted-foreground">
              Explore fresh sounds and hidden gems with our AI-powered
              recommendation system
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="standard" className="flex items-center gap-2">
            <Music className="w-4 h-4" />
            Standard
          </TabsTrigger>
          <TabsTrigger value="enhanced" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Enhanced AI
            <Badge variant={"secondary"} className="text-primary text-xs">
              Experimental
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enhanced">
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="font-semibold text-primary">
                Enhanced AI Features
              </span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Confidence scoring for each recommendation</li>
              <li>• Adaptive learning from your feedback</li>
              <li>• Multiple recommendation sources</li>
              <li>• Real-time preference adjustments</li>
            </ul>
          </div>
          <EnhancedDiscoveryList
            genres={["metal", "rock"]}
            location="Bulgaria"
            enableEnhanced={true}
          />
        </TabsContent>

        <TabsContent value="standard">
          <div className="p-4 bg-muted/50 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Music className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold">Standard Discovery</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Classic music discovery experience with location-based filtering
              and genre preferences
            </p>
          </div>
          <DiscoveryList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
