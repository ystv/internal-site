"use client";

import { SetStateAction, useEffect, useState } from "react";
import { Button, Card, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useWebsocket } from "@/components/WebsocketProvider";

export default function MainPage(props: { test: () => void }) {
  const { socket, isConnected, transport } = useWebsocket();

  const [returned, setReturned] = useState("");

  const [messages, setMessages] = useState<string[]>([]);

  const [textInput, setTextInput] = useState<string>("");

  const uuid = "Your Mother";

  useEffect(() => {
    function onPong(value: any) {
      console.log("Hello!");
      notifications.show({
        message: "Ooh you're popular",
      });
    }

    function onMessageReceive(value: any) {
      console.log("Received a message");
      setMessages(messages.concat(value));
    }

    socket.on("pong", onPong);
    socket.on("message:receive", onMessageReceive);

    return () => {
      socket.off("pong", onPong);
      socket.off("message:receive", onMessageReceive);
    };
  }, []);

  return (
    <div>
      <Button
        onClick={() => {
          console.log("pinging hopefully");
          socket.emit("ping", uuid);
          props.test();
        }}
      >
        Ping with {uuid}!
      </Button>
      <p>Returned: {returned}</p>
      <p>Status: {isConnected ? "connected" : "disconnected"}</p>
      <p>Transport: {transport}</p>
      <p>{textInput}</p>
      <TextInput
        onInput={(event) => {
          setTextInput(event.currentTarget.value);
        }}
        value={textInput ?? ""}
      />
      <Button
        onClick={() => {
          if (textInput !== "") {
            socket.emit("message:send", textInput);
            setTextInput("");
          }
        }}
      >
        Send
      </Button>
      <Card>
        {messages.map((message, index) => {
          return <p key={index}>{message}</p>;
        })}
      </Card>
    </div>
  );
}
