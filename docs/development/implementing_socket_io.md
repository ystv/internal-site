# Implementing Socket.io

This documentation (if you can call it that) will cover the basics of how to implement socket.io communication as a part of this application.

## Client

Here is some example code for a client component that takes an initial value, and upon receiving the message `valueUpdate`, will update the stored value and re-render it out.

**UpdatedValue.tsx**

```ts
"use client";

import { useWebsocket } from "@/components/WebsocketProvider";
import { useState } from "react";

export function UpdatedValue(props: { initialValue: string }) {
  // Place the initial value in a react state so it can be easily updated
  const [value, setValue] = useState<string>(props.value);

  // This component relies on being wrapped in a WebsocketProvider
  // The layout for all authenticated pages already includes this
  const { socket, isConnected, transport } = useWebsocket();

  // useEffect ensures that listeners are only registered when a componentis rendered, and handles removal of the listeners on re-render or unmount
  useEffect(() => {
    function onValueUpdate(value: any) {
      setValue(value);
    }

    // Listeners must use named functions in order to be properly un-registered on un-mount of the component
    socket.on(`valueUpdate`, onValueUpdate);

    // This is called when a component is unmounted to avoid duplicate calls when a message is received
    return () => {
      socket.off(`valueUpdate`, onValueUpdate);
    };
  }, []);

  return (
    <p>{value}</p>
  )
}
```

## Server

Sending messages from the Next.js (next) server to a client requires the next server to make a connection to the Socket.io (socket) server first, and then have the socket server relay that message.

**actions.ts**

```ts
"use server";

import { socket } from "@/lib/socket/server";

// In production this function should have an input type of unknown and implement validation with Zod, however for the simplicity of this example this has been skipped
export function updateValueAction(value: string) {
  socket.emit("valueUpdateServerSide", value);
}
```

**server.ts**

```ts
// Placed inside the io.on("connection") block

socket.on("valueUpdateServerSide", (value) => {
  if (isServerSocket(socket)) {
    io.emit("valueUpdate", value);
  }
});
```

### Useful Links (mostly from getting this working)

- https://stackblitz.com/edit/github-oqhe9b
