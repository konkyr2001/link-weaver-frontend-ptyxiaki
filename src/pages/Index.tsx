import { BundleCreator } from "@/components/BundleCreator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/hooks/use-theme";
import { Link2 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { getUser } from "@/services/user";
import Header from "@/components/Header";
import { useEffect, useState } from "react";

const Index = () => {
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  useEffect(() => {
    const fetchFreshUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const freshUser = await getUser(token);
      if (!freshUser?.error) {
        localStorage.setItem("user", JSON.stringify(freshUser));
        setUser(freshUser);
      }
    };
    fetchFreshUser();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <Header active="home" />

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Share links,{" "}
              <span className="text-gradient">not chaos</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Bundle multiple URLs into one clean, shareable link. Like WeTransfer, but for links.
            </p>
          </motion.div>

          <BundleCreator />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="max-w-6xl mx-auto px-6 text-center text-muted-foreground text-sm">
          Paste. Bundle. Share.
        </div>
      </footer>
    </div>
  );
};

export default Index;
