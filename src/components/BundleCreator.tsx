import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Copy, Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LinkInput } from "@/components/LinkInput";
import { LinkItem } from "@/components/LinkItem";
import { BundleLink, generateId, createBundle, normalizeUrl } from "@/lib/bundle";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { createPortal } from "react-dom";
import Captcha from "react-google-recaptcha";
import { useTheme } from "@/hooks/use-theme";

export function BundleCreator() {
  const token = localStorage.getItem("token");
  const { theme, toggleTheme } = useTheme();
  const [title, setTitle] = useState("");
  const [links, setLinks] = useState<BundleLink[]>([]);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const captchaRef = useRef<Captcha>(null);

  const isValidUrl = (url: string): boolean => {
    const normalized = normalizeUrl(url);
    try {
      const parsed = new URL(normalized);
      // Must have a dot in the hostname (e.g. example.com)
      return /\.[a-z]{2,}$/i.test(parsed.hostname);
    } catch {
      return false;
    }
  };

  const addLink = (url: string) => {
    if (!isValidUrl(url)) {
      toast.error("Please enter a valid URL");
      return;
    }
    const normalized = normalizeUrl(url);
    const newLink: BundleLink = {
      id: generateId(),
      url: normalized,
    };
    setLinks((prev) => [...prev, newLink]);
    setGeneratedUrl(null);
  };

  const removeLink = (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
    setGeneratedUrl(null);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const from = result.source.index;
    const to = result.destination.index;
    if (from === to) return;
    setLinks((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setGeneratedUrl(null);
  };

  const generateLink = async () => {
    if (!title.trim()) {
      toast.error("Give your bundle a title first");
      return;
    }
    if (links.length === 0) {
      toast.error("Add at least one link first");
      return;
    }
    const bundle = { 
      title: title.trim() || undefined, 
      links, createdAt: Date.now(),
    };
    let captcha = null;
    if (!token) {
      captcha = await captchaRef.current?.executeAsync();
      captchaRef.current.reset();
    }
    const userToken = token || null;
    const url = await createBundle(bundle, userToken, captcha);
    setGeneratedUrl(url);
  };

  const copyToClipboard = async () => {
    if (!generatedUrl) return;
    await navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {!token && (
        <Captcha
          key={theme}
          theme={theme}
          ref={captchaRef}
          size="invisible"
          sitekey={import.meta.env.VITE_RECAPTCHA_INVISIBLE_SECRET_KEY}
        />
      )}
      <div className="w-full max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-card rounded-2xl p-8 space-y-6"
        >
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Link2 className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <input
                value={title}
                onChange={(e) => { setTitle(e.target.value); setGeneratedUrl(null); }}
                placeholder="Bundle title here..."
                className="font-display text-lg font-semibold text-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground w-full"
              />
              <p className="text-muted-foreground text-sm">Add your links and share them in one URL</p>
            </div>
          </div>

          {/* Input */}
          <LinkInput onAdd={addLink} />

          {/* Links list */}
          <div className="space-y-2 min-h-[60px]">
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="links">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                    {links.map((link, i) => (
                      <Draggable key={link.id} draggableId={link.id} index={i}>
                        {(provided, snapshot) => {
                          const child = (
                            <div ref={provided.innerRef} {...provided.draggableProps} style={provided.draggableProps.style}>
                              <LinkItem
                                link={link}
                                index={i}
                                onRemove={removeLink}
                                dragHandleProps={provided.dragHandleProps ?? undefined}
                              />
                            </div>
                          );
                          return snapshot.isDragging ? createPortal(child, document.body) : child;
                        }}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {links.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-10 text-muted-foreground text-sm"
              >
                Paste URLs above to start building your bundle
              </motion.div>
            )}
          </div>

          {/* Generate button */}
          {links.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Button
                onClick={generateLink}
                variant="hero"
                size="lg"
                className="w-full h-12 text-base"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Generate Share Link
              </Button>

              {/* Generated URL */}
              <AnimatePresence>
                {generatedUrl && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-secondary/50 rounded-lg p-4 flex items-center gap-3">
                      <p className="text-sm text-foreground truncate flex-1 font-mono">
                        {generatedUrl}
                      </p>
                      <Button
                        onClick={copyToClipboard}
                        variant="glass"
                        size="sm"
                        className="flex-shrink-0"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 mr-1" />
                        ) : (
                          <Copy className="w-4 h-4 mr-1" />
                        )}
                        {copied ? "Copied" : "Copy"}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>
      </div>
    </>
  );
}
