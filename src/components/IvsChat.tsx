"use client";
import { useState, useEffect } from "react";
import { Button, Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { env } from "process";
import { ivsChatRoomList } from "@/utis/ivs-chat-roomlist";
import { XMarkIcon } from '@heroicons/react/24/solid';

export const IvsChat = () => {
  const [chatList, setChats] = useState<string[]>([]);
  const [connection, setConnection] = useState<WebSocket | null>(null);
  const [chatClientToken, setClientToken] = useState<string>("");
  const [arnName, setArnName] = useState<string>("Japanese");

  let [isOpen, setIsOpen] = useState(true)

  const open = () => {
    setIsOpen(true)
  }

  const close = () => {
    setIsOpen(false)
  }

  const joinChatRoom = (chatClientToken: string) => {
    const socketUrl = "wss://edge.ivschat.ap-northeast-1.amazonaws.com";
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
      console.log({ data });
      console.log(data.Attributes.text);
      setChats((prevMessages) => [...prevMessages, data.Attributes.text]);
    };
  };

  const requestChatToken = async (arn: string) => {
    console.log("fetch start");
    try {
      const response = await fetch(
        "https://8w6r5rzr2a.execute-api.ap-northeast-1.amazonaws.com/prod/createChatToken",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomIdentifier:
              arn, // required
            userId: "jaws-pankration", // required
          }),
        },
      );
      console.log("fetch done");
      const data = await response.json();
      console.log({ data });
      console.log(data.token);
      setClientToken(data.token);
      joinChatRoom(data.token);
      return data.token;
    } catch (error) {
      console.error("Error requesting chat token", error);
    }
  };

  const handleLanguageChange = (name: string, arn: string) => {

    if (connection) {
      connection.close();
    }

    requestChatToken(arn);
    setArnName(name);
    setClientToken("");
    setConnection(null);
    setChats([]); // Clear chat history when changing topic
  };


  useEffect(() => {
    const socketUrl = "wss://edge.ivschat.ap-northeast-1.amazonaws.com";
    const connection = new WebSocket(socketUrl, chatClientToken);

    setIsOpen(false);
    requestChatToken("arn:aws:ivschat:ap-northeast-1:590183817826:room/j0Bpz9gSqfZQ");

    return () => {
      if (connection) {
        connection.close();
      }
    };
  }, []);


  return (
    <div className="px-4 m-0 w-full max-w-lg sm:max-w-xl lg:max-w-2xl h-[450px] sm:h-[500px] lg:h-[550px] overflow-auto text-center text-white">
      <Button
        onClick={open}
        className="mb-3 rounded-md bg-green-300 py-2 px-4 text-sm font-bold text-green-800 focus:outline-none data-[hover]:bg-green-500 data-[focus]:outline-1 data-[focus]:outline-white"
      >
        Language Select
      </Button>

      <Dialog open={isOpen} as="div" className="relative z-10 focus:outline-none" onClose={close}>
      <div className="fixed inset-0 z-10 w-screen h-screen bg-black bg-opacity-50">
        <div className="flex h-full items-center justify-center">
          <DialogPanel
            transition
            className="relative w-full max-w-5xl max-h-[90vh] bg-white/10 p-12 backdrop-blur-2xl duration-300 ease-out overflow-y-auto rounded-lg"
          >
            {/* 閉じるボタン */}
            <button
              onClick={close}
              className="absolute top-4 right-4 text-white hover:text-gray-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            {/* タイトル */}
            <DialogTitle as="h3" className="col-span-3 text-2xl font-medium text-white text-center mb-12">
              Please select the language you want to display.
            </DialogTitle>

            {/* ボタンリスト */}
            <div className="grid grid-cols-3 gap-8">
              {ivsChatRoomList.map((language) => (
                <button
                  key={language.name}
                  onClick={() => handleLanguageChange(language.name, language.arn)}
                  className={`flex items-center justify-center w-full px-4 py-2 rounded-lg text-lg
                    ${language.name === arnName ? 'bg-blue-500 text-white' : 'bg-white text-black'}
                  `}
                >
                  {language.name}
                </button>
              ))}
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>

      <div className="w-full text-center p-1 overflow-auto bg-white text-black rounded-md font-bold h-full">
        <>
          {chatList.map((chat, index) => (
            <div className="break-words" key={`${index}`}>
              {chat}
            </div>
          ))}
        </>
      </div>
    </div>
  );
};
