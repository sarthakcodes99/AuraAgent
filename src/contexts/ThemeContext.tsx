import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ThemeName = 
  | "crimson-night" 
  | "ocean-depths" 
  | "forest-mystique" 
  | "golden-sunset" 
  | "cyber-neon" 
  | "midnight-purple";

interface Theme {
  name: ThemeName;
  label: string;
  description: string;
  preview: string[];
}

export const themes: Theme[] = [
  {
    name: "crimson-night",
    label: "Crimson Night",
    description: "Deep reds and dark purples",
    preview: ["#1a0a0f", "#dc2626", "#9333ea"]
  },
  {
    name: "ocean-depths",
    label: "Ocean Depths",
    description: "Calming blues and teals",
    preview: ["#0a1628", "#0ea5e9", "#14b8a6"]
  },
  {
    name: "forest-mystique",
    label: "Forest Mystique",
    description: "Rich greens and earth tones",
    preview: ["#0a1a0f", "#22c55e", "#84cc16"]
  },
  {
    name: "golden-sunset",
    label: "Golden Sunset",
    description: "Warm ambers and oranges",
    preview: ["#1a1408", "#f59e0b", "#ea580c"]
  },
  {
    name: "cyber-neon",
    label: "Cyber Neon",
    description: "Electric pinks and cyans",
    preview: ["#0f0a1a", "#ec4899", "#06b6d4"]
  },
  {
    name: "midnight-purple",
    label: "Midnight Purple",
    description: "Deep violet and indigo",
    preview: ["#0f0a1f", "#8b5cf6", "#6366f1"]
  }
];

interface ThemeContextType {
  currentTheme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(() => {
    const saved = localStorage.getItem("auraagent-theme");
    return (saved as ThemeName) || "crimson-night";
  });

  useEffect(() => {
    localStorage.setItem("auraagent-theme", currentTheme);
    document.documentElement.setAttribute("data-theme", currentTheme);
  }, [currentTheme]);

  const setTheme = (theme: ThemeName) => {
    setCurrentTheme(theme);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
