
import { ReactNode } from "react";
import { Shield } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      <header className="border-b border-slate-200/50 backdrop-blur-sm bg-white/70 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-medium">Password Strength Analyzer</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Home
            </a>
            <a href="securitytips" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Security Tips
            </a>
            <a href="faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </a>
          </nav>
        </div>
      </header>
      
      <main className="flex-1">
        {children}
      </main>
      
      <footer className="border-t border-slate-200/50 backdrop-blur-sm bg-white/70 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>This site doesn't store your passwords. All analysis happens locally.</p>
          <p className="mt-2">© {new Date().getFullYear()} Password Strength Analyzer</p>
        </div>
      </footer>
    </div>
  );
}
