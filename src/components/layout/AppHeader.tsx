import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Menu,
  ArrowLeft,
  LayoutDashboard,
  ScanLine,
  Settings,
  LogOut,
  Loader2,
  Home,
} from "lucide-react";
import logo from "@/assets/logo.png";

interface AppHeaderProps {
  title?: string;
  showBackButton?: boolean;
  backPath?: string;
}

export function AppHeader({ title, showBackButton = false, backPath = "/dashboard" }: AppHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      console.log("🔓 [AppHeader] Logging out user...");
      
      localStorage.removeItem("onboarding_data");
      await signOut();
      
      console.log("✅ [AppHeader] User logged out successfully");
      setIsOpen(false);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("❌ [AppHeader] Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  const navigateTo = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: ScanLine, label: "New Scan", path: "/scan/new" },
    { icon: Settings, label: "Settings", path: "/dashboard/settings" },
  ];

  return (
    <div className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center px-4 gap-4">
        {/* Hamburger Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <SheetHeader className="p-4 pb-2">
              <SheetTitle className="flex items-center gap-2">
                <img src={logo} alt="Logo" className="h-8 w-auto" />
              </SheetTitle>
            </SheetHeader>
            
            <div className="px-2 py-2">
              {/* User Info */}
              {user && (
                <div className="px-3 py-3 mb-2">
                  <p className="text-sm font-medium truncate">{user.email}</p>
                  <p className="text-xs text-muted-foreground">Logged in</p>
                </div>
              )}
              
              <Separator className="my-2" />
              
              {/* Navigation Links */}
              <nav className="space-y-1 py-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigateTo(item.path)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        active
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
              
              <Separator className="my-2" />
              
              {/* Home Link */}
              <div className="py-2">
                <button
                  onClick={() => navigateTo("/")}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <Home className="h-5 w-5" />
                  Back to Home
                </button>
              </div>
              
              <Separator className="my-2" />
              
              {/* Logout */}
              <div className="py-2">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                >
                  {isLoggingOut ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <LogOut className="h-5 w-5" />
                  )}
                  {isLoggingOut ? "Logging out..." : "Log Out"}
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Back Button (optional) */}
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(backPath)}
            className="shrink-0 -ml-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}

        {/* Title */}
        {title && (
          <h2 className="text-lg font-semibold truncate">{title}</h2>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Logo on right (small) */}
        <Link to="/dashboard" className="shrink-0">
          <img src={logo} alt="Logo" className="h-8 w-auto" />
        </Link>
      </div>
    </div>
  );
}
