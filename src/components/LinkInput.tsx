import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

interface LinkInputProps {
  onAdd: (url: string) => void;
}

export function LinkInput({ onAdd }: LinkInputProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setUrl("");
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full min-w-0"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste a URL here..."
        className="w-full min-w-0 flex-1 h-12 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground text-sm sm:text-base font-body"
      />
      <Button type="submit" variant="hero" size="lg" className="w-full sm:w-auto h-8 sm:h-12 sm:px-6 shrink-0">
        <Plus className="w-5 h-5 mr-1" />
        Add
      </Button>
    </motion.form>
  );
}
