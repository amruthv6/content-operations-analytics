import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import ContentLibrary from "@/pages/content-library";
import CreateContent from "@/pages/create-content";
import ContentDetail from "@/pages/content-detail";
import ContentCalendar from "@/pages/calendar";
import AnalyticsOverview from "@/pages/analytics";
import CategoryManager from "@/pages/categories";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/content" component={ContentLibrary} />
        <Route path="/content/new" component={CreateContent} />
        <Route path="/content/:id" component={ContentDetail} />
        <Route path="/calendar" component={ContentCalendar} />
        <Route path="/analytics" component={AnalyticsOverview} />
        <Route path="/categories" component={CategoryManager} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
