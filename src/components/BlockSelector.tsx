import { Card } from "./ui/card";
import { Button } from "./ui/button";

interface BlockType {
  name: string;
  color: string;
}

interface BlockSelectorProps {
  selectedBlock: string;
  onSelectBlock: (block: string) => void;
  blockTypes: BlockType[];
}

export const BlockSelector = ({
  selectedBlock,
  onSelectBlock,
  blockTypes,
}: BlockSelectorProps) => {
  return (
    <Card className="p-4 bg-card/80 backdrop-blur-sm border-2">
      <h2 className="text-lg font-semibold mb-3 text-foreground">Select Block Type</h2>
      <div className="flex flex-wrap gap-2">
        {blockTypes.map((block) => (
          <Button
            key={block.name}
            onClick={() => onSelectBlock(block.name)}
            variant={selectedBlock === block.name ? "default" : "outline"}
            className="min-w-[100px] h-12 text-sm font-medium transition-all"
            style={{
              backgroundColor:
                selectedBlock === block.name ? block.color : "transparent",
              borderColor: block.color,
              borderWidth: "2px",
              color: selectedBlock === block.name ? "white" : block.color,
            }}
          >
            {block.name}
          </Button>
        ))}
      </div>
    </Card>
  );
};
