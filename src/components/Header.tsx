import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/hooks/use-theme";
import { Link2, Menu, X } from "lucide-react";
import { googleLogout } from "@react-oauth/google";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

type HeaderProps = {
  active?: "home" | "pricing" | "login" | "signup" | "history";
};

const Header = ({ active }: HeaderProps) => {
  const { theme, toggleTheme } = useTheme();
  const user = JSON.parse(localStorage.getItem("user"));
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    googleLogout();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const linkClass = (key: string) =>
    `text-sm font-medium ${
      active === key
        ? "text-primary"
        : "text-muted-foreground hover:text-foreground transition-colors"
    }`;

  const navLinks = (
    <>
      {user && (
        <Link to="/history" className={linkClass("history")} onClick={() => setOpen(false)}>
          History
        </Link>
      )}
    </>
  );

  const actionButton = user ? (
    <Button onClick={handleLogout}>Logout</Button>
  ) : active === "login" ? (
    <Button asChild>
      <Link to="/signup" onClick={() => setOpen(false)}>Sign up</Link>
    </Button>
  ) : (
    <Button asChild>
      <Link to="/login" onClick={() => setOpen(false)}>Login</Link>
    </Button>
  );

  return (
    <header className="border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="group flex items-center gap-2 text-primary"
        >
          <Link2 className="w-5 h-5 transition-all duration-300 ease-out group-hover:scale-110" />
          <span className="font-display font-bold text-lg">
            <span className="transition-all duration-300 ease-out text-foreground group-hover:text-primary">
              We
            </span>
            <span className="text-primary transition-all duration-300 ease-out group-hover:tracking-wide">
              Linkly
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks}
          {actionButton}
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>

        {/* Mobile nav */}
        <div className="flex md:hidden items-center gap-3">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <nav className="flex flex-col gap-6 mt-8">
                {navLinks}
                {actionButton}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
