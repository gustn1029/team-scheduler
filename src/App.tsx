import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./utils/http";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <h1>team-scheduler</h1>
    </QueryClientProvider>
  );
}

export default App;
