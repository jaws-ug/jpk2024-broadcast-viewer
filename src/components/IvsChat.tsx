"use client";
import { useState, useEffect, useRef } from "react";
import { Button, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { ivsChatRoomList } from "@/utis/ivs-chat-roomlist";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useTimer } from "react-timer-hook";
import exp from "constants";

export const IvsChat = () => {
  const [chatList, setChats] = useState<string[]>([""]);
  const [isFirstTime, setIsFirstTime] = useState<boolean>(true);
  const [connection, setConnection] = useState<WebSocket | null>(null);
  const [chatClientToken, setClientToken] = useState<string>("");
  const [arnName, setArnName] = useState<string>("Japanese");
  const [arn, setArn] = useState<string>(
    "arn:aws:ivschat:ap-northeast-1:590183817826:room/RfWlo5LhpnZM",
  );
  const expiryTimestamp = new Date();
  const { restart } = useTimer({
    expiryTimestamp,
    onExpire: () => handleLanguageChange(arnName, arn),
  });
  const scrollBottomRef = useRef<HTMLDivElement>(null);

  let [isOpen, setIsOpen] = useState(true);

  const open = () => {
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  const joinChatRoom = (chatClientToken: string) => {
    const socketUrl = "wss://edge.ivschat.ap-northeast-1.amazonaws.com";
    const connections = new WebSocket(socketUrl, chatClientToken);
    setConnection(connections);

    connections.onopen = () => {
      expiryTimestamp.setMinutes(expiryTimestamp.getMinutes() + 160);
      restart(expiryTimestamp);
      console.log("update token" + expiryTimestamp);
      console.log("Connected to chat server");
    };

    connections.onclose = () => {
      console.log("Disconnected from chat server");
    };

    connections.onerror = (error) => {
      console.error("Chat server error", error);
    };

    connections.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setChats((prevMessages) => [...prevMessages, data.Attributes.text]);
      scrollBottomRef?.current?.scrollIntoView({
        block: "end",
        behavior: "smooth",
      });
    };
  };

  const requestChatToken = async (arn: string) => {
    try {
      const response = await fetch(
        "https://8w6r5rzr2a.execute-api.ap-northeast-1.amazonaws.com/prod/createChatToken",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomIdentifier: arn, // required
            userId: "jaws-pankration", // required
          }),
        },
      );
      await response.json().then((data) => {
        setClientToken(data.token);
        joinChatRoom(data.token);
        return data.token;
      });
    } catch (error) {
      console.error("Error requesting chat token", error);
    }
  };

  const handleLanguageChange = (name: string, arn: string) => {
    if (connection) {
      connection.close();
      setClientToken("");
    }

    setIsOpen(false);

    requestChatToken(arn);
    setArnName(name);
    setArn(arn);
    setChats([]);
  };

  useEffect(() => {
    if (isFirstTime) {
      handleLanguageChange(arnName, arn);
      setIsFirstTime(false);
    }
    setIsOpen(false);
  }, [chatClientToken]);

  return (
    <>
      <div className="flex justify-center items-center mb-3">
        <Button
          onClick={open}
          className="text-center rounded-md bg-orange-500 py-2 px-4 text-sm font-bold text-white focus:outline-none data-[hover]:bg-orange-600 data-[focus]:outline-1 data-[focus]:outline-white"
        >
          Language Select
        </Button>
      </div>

      <div className="px-4 m-0 w-full h-[450px] sm:h-[500px] lg:h-[550px] overflow-auto text-center text-white">
        <Dialog
          open={isOpen}
          as="div"
          className="relative z-10 focus:outline-none"
          onClose={close}
        >
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
                <DialogTitle
                  as="h3"
                  className="col-span-3 text-2xl font-medium text-white text-center mb-12"
                >
                  Please select the language you want to display.
                </DialogTitle>

                {/* ボタンリスト */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {ivsChatRoomList.map((language) => (
                    <button
                      key={language.name}
                      onClick={() =>
                        handleLanguageChange(language.name, language.arn)
                      }
                      className={`flex items-center justify-center w-full px-4 py-2 rounded-lg text-lg
          ${language.name === arnName ? "bg-blue-500 text-white" : "bg-white text-black"}`}
                    >
                      {language.name}
                    </button>
                  ))}
                </div>
              </DialogPanel>
            </div>
          </div>
        </Dialog>

        <div className="w-full text-center p-5 overflow-auto bg-white/20 bg-opacity-20 text-white rounded-md font-bold h-full">
          <>
            {chatList.map((chat, index) => (
              <div
                className="break-words"
                key={`${index}`}
                ref={scrollBottomRef}
              >
                {chat}
              </div>
            ))}
          </>
        </div>
      </div>
    </>
  );
};
