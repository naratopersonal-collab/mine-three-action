import { useEffect, useRef } from "react";
import { useMinecraftWorld } from "@/hooks/useMinecraftWorld";
import { BlockSelector } from "./BlockSelector";
import { Card } from "./ui/card";

export const MinecraftGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { 
    selectedBlock, 
    setSelectedBlock, 
    blockTypes,
    initializeGame 
  } = useMinecraftWorld(canvasRef);

  useEffect(() => {
    if (canvasRef.current) {
      const cleanup = initializeGame();
      return cleanup;
    }
  }, [initializeGame]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent to-background p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-2">
          <h1 className="text-4xl font-bold text-foreground mb-2 pixel-text">
            Minecraft Craft
          </h1>
          <p className="text-muted-foreground">
            Left click to place blocks • Right click to remove blocks • WASD to move • Mouse to look around
          </p>
        </Card>

        <BlockSelector
          selectedBlock={selectedBlock}
          onSelectBlock={setSelectedBlock}
          blockTypes={blockTypes}
        />

        <Card className="overflow-hidden border-4 border-border shadow-2xl">
          <canvas
            ref={canvasRef}
            className="w-full h-[600px] cursor-crosshair"
            style={{ imageRendering: 'pixelated' }}
          />
        </Card>
      </div>
    </div>
  );
};
