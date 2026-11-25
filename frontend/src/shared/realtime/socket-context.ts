import { createContext } from "react";
import type SocketContextType from "./types";

export const SocketContext = createContext<SocketContextType | null>(null);
