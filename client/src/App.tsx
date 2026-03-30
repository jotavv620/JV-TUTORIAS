import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import TutoriaManagerIntegrated from "./pages/TutoriaManagerIntegrated";
import PublicDashboard from "./pages/PublicDashboard";
import { useCustomAuth } from "@/_core/hooks/useCustomAuth";
import Home from "./pages/Home";
import AdminBolsistas from "./pages/AdminBolsistas";
import AdminTokens from "./pages/AdminTokens";
import LoginTest from "./pages/LoginTest";

function Router() {
  const { isAuthenticated, loading } = useCustomAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-600 font-bold">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path={"/"} component={isAuthenticated ? TutoriaManagerIntegrated : Home} />
      <Route path={"/app"} component={TutoriaManagerIntegrated} />
      <Route path={"/dashboard"} component={PublicDashboard} />
      <Route path={"/admin/bolsistas"} component={AdminBolsistas} />
      <Route path={"/admin/tokens"} component={AdminTokens} />
      <Route path={"/login-test"} component={LoginTest} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
