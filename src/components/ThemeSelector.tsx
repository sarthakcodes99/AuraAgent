import { Palette, Check } from "lucide-react";
import { useTheme, themes, ThemeName } from "@/contexts/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const ThemeSelector = () => {
  const { currentTheme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover:bg-primary/10"
        >
          <Palette className="w-5 h-5 text-foreground/80" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Choose Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.name}
            onClick={() => setTheme(theme.name)}
            className="cursor-pointer flex items-center gap-3 py-3"
          >
            {/* Theme Preview Colors */}
            <div className="flex gap-1">
              {theme.preview.map((color, index) => (
                <div
                  key={index}
                  className="w-4 h-4 rounded-full border border-border/50"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            
            {/* Theme Info */}
            <div className="flex-1">
              <p className="text-sm font-medium">{theme.label}</p>
              <p className="text-xs text-muted-foreground">{theme.description}</p>
            </div>
            
            {/* Check Mark for Selected */}
            {currentTheme === theme.name && (
              <Check className="w-4 h-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSelector;
