import { FlowBuilder } from "@/components/flow/FlowBuilder";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ThemeProvider";

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <FlowBuilder />
      <Toaster />
    </ThemeProvider>
  );
}

export default App;

