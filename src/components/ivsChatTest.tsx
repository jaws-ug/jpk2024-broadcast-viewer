"use client";
import { useState, useEffect, useCallback } from "react";
import { Field, Label, Select } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { env } from "process";
import { join } from "path";

export const IvsChatTest = () => {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [chatClientToken, setClientToken] = useState<boolean>(false);
  const [connection, setConnection] = useState<WebSocket | null>(null);
  const [chatList, setChats] = useState<string[]>([]);
  const [topicName, setTopicName] = useState<string>("Japanese");
  const [messages, setMessages] = useState<string[]>([]);

  const [testMessages, setTestMessages] = useState<string>("");

  const sendMessage = (message: string) => {
    const payload = {
      Action: "SEND_MESSAGE",
      RequestId: "Japanese",
      Content: "text message",
      Attributes: {
        CustomMetadata: "test metadata",
      },
    };
    if (connection) {
      connection.send(JSON.stringify(payload));
      setTestMessages(""); // Clear the input field
    }
  };

  const joinChatRoom = useCallback(
    (chatClientToken: string) => {
      const socketUrl = process.env.socketUrl || "";
      const connection = new WebSocket(socketUrl, chatClientToken);
      setConnection(connection);

      connection.onopen = () => {
        console.log("Connected to chat server");
      };

      connection.onclose = () => {
        console.log("Disconnected from chat server");
      };

      connection.onerror = (error) => {
        console.error("Chat server error", error);
      };

      connection.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setMessages((prevMessages) => [...prevMessages, data.Content]);
      };
    },
    [setConnection, setMessages],
  );

  const requestChatToken = useCallback(async () => {
    try {
      const response = await fetch(process.env.IVS_CHAT_TOKEN_URL || "", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ChannelARN: process.env.IVS_CHANNEL_ARN,
        }),
      });
      const data = await response.json();
      setClientToken(data.Token);
      joinChatRoom(data.Token);
      return data.Token;
    } catch (error) {
      console.error("Error requesting chat token", error);
    }
  }, [joinChatRoom, setClientToken]);

  const handleTopicChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTopicName(event.target.value);
    setChats([]); // Clear chat history when changing topic
  };

  useEffect(() => {
    if (!isLoading) {
      setLoading(true);
      requestChatToken();
    }
  }, [isLoading, requestChatToken]);

  return (
    <div className="grid grid-cols-5 p-4 m-0 text-center h-[250px] overflow-auto bg-gray-700 text-white">
      <div className="col-span-1">
        <div className="max-w-md px-4">
          <Field>
            <div className="flex flex-col items-center">
              <Label className="text-sm/6 font-medium text-white mb-1.5">
                Language
              </Label>
              <div className="relative w-1/2">
                <Select
                  className={clsx(
                    "block w-full appearance-none rounded-lg border-none bg-white/1 py-1.5 px-3 text-sm/6 text-black pr-10",
                    "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25",
                    "*:text-black",
                  )}
                  onChange={handleTopicChange}
                  value={topicName} // Ensure the selected value is reflected
                >
                  <option value="Japanese">Japanese</option>
                  <option value="English">English</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Korean">Korean</option>
                </Select>
                <ChevronDownIcon
                  className="pointer-events-none absolute top-1/2 right-3 transform -translate-y-1/2 size-4 fill-black/60"
                  aria-hidden="true"
                />
              </div>
            </div>
          </Field>
        </div>
      </div>
      <div className="col-span-3 h-full w-full p-1 overflow-auto bg-white text-black rounded-md font-bold">
        <>
          {chatList.map((chat, index) => (
            <div className="break-words" key={`${index}`}>
              {chat}
            </div>
          ))}
        </>
      </div>
      <div className="col-span-8 h-full w-full p-1 overflow-auto bg-white text-black rounded-md font-bold">
        This is a test chat
        <form className="flex flex-col items-center">
          <input
            type="text"
            value={testMessages}
            onChange={(e) => setTestMessages(e.target.value)}
          ></input>
          <button onClick={() => sendMessage(testMessages)}>
            Send TestMessage
          </button>
        </form>
      </div>
    </div>
  );
};
