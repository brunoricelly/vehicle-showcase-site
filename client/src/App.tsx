import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ComparisonProvider } from "./contexts/ComparisonContext";
import ComparisonFloatingNav from "./components/ComparisonFloatingNav";
import Home from "./pages/Home";
import VehicleDetailNew from "./pages/VehicleDetailNew";
import AdminDashboard from "./pages/AdminDashboard";
import AdminVehicleForm from "./pages/AdminVehicleForm";
import AdminHistory from "./pages/AdminHistory";
import AdminVehicleImages from "./pages/AdminVehicleImages";
import AdminPanel from "./pages/AdminPanel";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/vehicle/:id"} component={VehicleDetailNew} />
      <Route path={"/comparison"} component={ComparisonPage} />
      <Route path={"/admin"} component={AdminPanel} />
      <Route path={"/admin/dashboard"} component={AdminDashboard} />
      <Route path={"/admin/vehicle/:id"} component={AdminVehicleForm} />
      <Route path={"/admin/vehicle/:id/images"} component={AdminVehicleImages} />
      <Route path={"/admin/history"} component={AdminHistory} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

import ComparisonPage from "./pages/ComparisonPage";

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <ComparisonProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
            <ComparisonFloatingNav />
          </TooltipProvider>
        </ComparisonProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
