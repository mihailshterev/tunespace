import type { RouteObject } from "react-router";
import { AppLayout } from "../layouts/app-layout";
import { BareLayout } from "../layouts/bare-layout";
import { LandingLayout } from "../layouts/landing-layout";
import { ProtectedRoute } from "../guards/protected-route";
import { RedirectIfAuthenticated } from "../guards/redirect-if-authenticated";
import { NotFoundPage } from "./not-found-page";
import { EventsPage } from "./events-page";
import { AboutView, CopyrightView, LandingView, PrivacyView, TermsView } from "@/features/landing";
import {
  ConfirmEmailChangeView,
  ConfirmEmailView,
  EmailConfirmationSentView,
  ForgotPasswordView,
  LoginView,
  ResetPasswordView,
  SignupView,
  SpotifyCallbackView,
  SpotifyConnectCallbackView,
} from "@/features/auth";
import { HomeView } from "@/features/home";
import { DiscoverView } from "@/features/discovery";
import { NewsView } from "@/features/news";
import { NotificationsView } from "@/features/notifications";
import { ProfileView } from "@/features/profile";
import { ChatView, MessagesView } from "@/features/messages";
import { ForumCategoryView, ForumThreadView, ForumsView, NewCategoryView, NewThreadView } from "@/features/forums";
import { BandChatView, BandDashboardView, BandRegisterView, BandShowcaseView } from "@/features/band";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <LandingLayout />,
    children: [
      {
        index: true,
        element: (
          <RedirectIfAuthenticated>
            <LandingView />
          </RedirectIfAuthenticated>
        ),
      },
      { path: "about", element: <AboutView /> },
      { path: "terms", element: <TermsView /> },
      { path: "privacy", element: <PrivacyView /> },
      { path: "copyright", element: <CopyrightView /> },
    ],
  },
  {
    element: <BareLayout />,
    children: [
      { path: "login", element: <LoginView /> },
      { path: "signup", element: <SignupView /> },
    ],
  },
  {
    path: "auth",
    children: [
      { path: "confirm-email", element: <ConfirmEmailView /> },
      { path: "confirm-email-change", element: <ConfirmEmailChangeView /> },
      { path: "email-confirmation-sent", element: <EmailConfirmationSentView /> },
      { path: "forgot-password", element: <ForgotPasswordView /> },
      { path: "reset-password", element: <ResetPasswordView /> },
      { path: "spotify-callback", element: <SpotifyCallbackView /> },
      { path: "spotify-connect-callback", element: <SpotifyConnectCallbackView /> },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "home", element: <HomeView /> },
      { path: "discover", element: <DiscoverView /> },
      { path: "events", element: <EventsPage /> },
      { path: "news", element: <NewsView /> },
      { path: "notifications", element: <NotificationsView /> },
      { path: "profile/:username", element: <ProfileView /> },
      { path: "messages", element: <MessagesView /> },
      { path: "messages/:chatId", element: <ChatView /> },
      { path: "forums", element: <ForumsView /> },
      { path: "forums/new-category", element: <NewCategoryView /> },
      { path: "forums/:categoryId", element: <ForumCategoryView /> },
      { path: "forums/:categoryId/new", element: <NewThreadView /> },
      { path: "forums/:categoryId/:threadId", element: <ForumThreadView /> },
      { path: "band/dashboard", element: <BandDashboardView /> },
      { path: "band/register", element: <BandRegisterView /> },
      { path: "band/:bandId", element: <BandShowcaseView /> },
      { path: "band/:bandId/chat/:id", element: <BandChatView /> },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
];
