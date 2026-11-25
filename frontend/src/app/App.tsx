import { useRoutes } from "react-router";
import { routes } from "./routes/routes";

export function App() {
  return useRoutes(routes);
}
