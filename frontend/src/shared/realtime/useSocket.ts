import { SocketContext } from "./socket-context";
import { useContext } from "react";

const useSocket = () => {
  const context = useContext(SocketContext);

  if (context === null) {
    throw new Error("useSocket must be used within an SocketProvider");
  }

  return context;
};

export default useSocket;
