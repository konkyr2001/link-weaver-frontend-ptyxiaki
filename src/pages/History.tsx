import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ExternalLink, Clock, FolderOpen } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { getUser, getUserHistory } from "@/services/user";
import { toast } from "sonner";

interface HistoryItem {
  _id: string;
  projectName: string;
  slug: string;
  expiresAt: string;
  createdAt: string;
  urlCount: number;
}

function daysRemaining(expiresAt: string): number {
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function hoursRemaining(expiresAt: string): number {
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60)));
}

export default function History() {
  const token = localStorage.getItem("token");
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;
      const freshUser = await getUser(token);
      if (!freshUser?.error) {
        localStorage.setItem("user", JSON.stringify(freshUser));
        setUser(freshUser);
      }
    };
    fetchUser();
    fetchHistory();
  }, []);

  async function fetchHistory() {
    setLoading(true);
    const token = localStorage.getItem("token");
    const data = await getUserHistory(token);
    if (data.error) {
      setLoading(false);
      return;
    }
    if (data.projects.length === 0) {
      setLoading(false);
      return;
    }
    setLoading(false);
    setItems(data.projects);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header active="history" />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Your Bundles
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            All the link bundles you've created
          </p>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card rounded-xl p-6 animate-pulse">
                  <div className="h-5 bg-muted rounded w-1/3 mb-3" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                You haven't created any bundles yet
              </p>
              <Link to="/">
                <Button variant="hero">Create your first bundle</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, i) => {
                const days = item.expiresAt ? daysRemaining(item.expiresAt) : null;
                // const days = 2;
                const bundleUrl = `${window.location.origin}/b/${item.slug}`;

                return (
                  <motion.div
                    key={item._id || i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card rounded-xl p-6 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <h2 className="font-display font-semibold text-foreground truncate">
                        {item.projectName}
                      </h2>
                      <p className="text-sm text-muted-foreground font-mono truncate mt-1">
                        {bundleUrl}
                      </p>
                      {days !== null && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                          <span
                            className={`text-xs font-medium ${
                              days < 3
                                ? "text-destructive"
                                : "text-muted-foreground"
                            }`}
                          >
                            {days === 0
                              ? `Expires in ${hoursRemaining(item.expiresAt)} hour${hoursRemaining(item.expiresAt) !== 1 ? "s" : ""}`
                              : `${days} day${days !== 1 ? "s" : ""} remaining`}
                          </span>
                        </div>
                      )}
                    </div>

                    <Link to={`/b/${item.slug}`}>
                      <Button variant="glass" size="sm">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
