/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { SocketProvider } from "@/store/socket";

export function SocketProviderWrapper({ children }:{children:any}) {
  return <SocketProvider>{children}</SocketProvider>;
}
