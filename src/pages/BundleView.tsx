import { useParams, Link } from "react-router-dom";
import { Bundle, fetchBundleBySlug } from "@/lib/bundle";
import { BundleLinkCard } from "@/components/BundleLinkCard";
import { motion } from "framer-motion";
import { Link2, ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/hooks/use-theme";

export default function BundleView() {
  const { theme, toggleTheme } = useTheme();
  const { slug } = useParams<{ slug: string }>();
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function loadBundle() {
      if (!slug) {
        setBundle(null);
        setLoading(false);
        return;
      }
      const result = await fetchBundleBySlug(slug);
      setLoading(false);
      setBundle(result);
    }

    loadBundle();
  }, [slug]);

  if (loading) {
    return;
  }

  if (!bundle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="font-display text-2xl font-bold text-foreground">Invalid Bundle</h1>
          <p className="text-muted-foreground">This link appears to be broken or expired.</p>
          <Link to="/">
            <Button variant="hero">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="group flex items-center gap-2 text-foreground transition-all duration-300 ease-out"
          >
            <ArrowLeft className="w-4 h-4 transition-all duration-300 group-hover:text-primary group-hover:-translate-x-1" />

            <div className="flex items-center gap-2">
              <Link2 className="w-5 h-5 transition-all duration-300 ease-out text-primary group-hover:scale-110" />

              <span className="font-display font-bold text-lg flex items-center">
                <span className="transition-all duration-300 ease-out group-hover:text-primary">
                  We
                </span>
                <span className="text-primary transition-all duration-300 ease-out group-hover:tracking-wide">
                  Linkly
                </span>
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <Link to="/">
              <Button variant="hero" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Create Bundle
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            {bundle.title || "Link Bundle"}
          </h1>
          <p className="text-muted-foreground">
            {bundle.links.length} link{bundle.links.length !== 1 ? 's' : ''} shared
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bundle.links.map((link, i) => (
            <BundleLinkCard key={link.id} link={link} index={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
