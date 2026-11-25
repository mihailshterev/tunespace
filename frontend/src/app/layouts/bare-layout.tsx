import { Outlet } from "react-router";

// Full-screen pages (login, sign-up) that skip the landing header and footer.
export function BareLayout() {
  return (
    <main>
      <Outlet />
    </main>
  );
}
