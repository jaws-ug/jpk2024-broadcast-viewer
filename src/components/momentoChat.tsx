"use client";
import { useEffect, useRef, useState } from "react";
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { type ChatEvent, EventTypes, subscribeToTopic } from "@/utis/momento-web";
import { type TopicItem, type TopicSubscribe } from "@gomomento/sdk-web";

export const MomentoChat = () => {
    const [chats, setChats] = useState<ChatEvent[]>([]);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const cacheName = "jpk2024-broadcast-viewer";
    const topicName = "test";

    const onItem = (item: TopicItem) => {
        try {
            const message = JSON.parse(item.valueString()) as ChatEvent;
            setChats((curr) => [...curr, message]);
        } catch (e) {
            console.error("unable to parse chat message", e);
        }
    };

    const onError = async (
        error: TopicSubscribe.Error,
        sub: TopicSubscribe.Subscription,
    ) => {
        console.error(
            "received error from momento, getting new token and resubscribing",
            error,
        );
        sub.unsubscribe();
        await subscribeToTopic(
            cacheName,
            topicName,
            onItem,
            onError
        );
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chats]);

    return (
        <div className="flex flex-col items-center p-4 bg-gray-800 text-white">
            <div className="mb-4">
                <Menu as="div" className="relative inline-block text-left">
                    <div>
                        <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                            Options
                            <ChevronDownIcon aria-hidden="true" className="-mr-1 h-5 w-5 text-gray-400" />
                        </MenuButton>
                    </div>

                    <MenuItems
                        transition
                        className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                    >
                        <div className="py-1">
                            <MenuItem>
                                <a
                                    href="#"
                                    className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900"
                                >
                                    Japanese
                                </a>
                            </MenuItem>
                            <MenuItem>
                                <a
                                    href="#"
                                    className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900"
                                >
                                    English
                                </a>
                            </MenuItem>
                            <MenuItem>
                                <a
                                    href="#"
                                    className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900"
                                >
                                    Chinese
                                </a>
                            </MenuItem>
                            <form action="#" method="POST">
                                <MenuItem>
                                    <button
                                        type="submit"
                                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900"
                                    >
                                        Korean
                                    </button>
                                </MenuItem>
                            </form>
                        </div>
                    </MenuItems>
                </Menu>
            </div>

            <div className="flex-grow overflow-y-auto w-full max-w-xl">
                {chats.map((chat) => {
                    const date = new Date(chat.timestamp);
                    const hours = date.getHours();
                    const minutes = date.getMinutes();
                    switch (chat.event) {
                        case EventTypes.MESSAGE:
                            const timestampWithUsername = `[${hours}:${minutes}] <${chat.username}>`;
                            return (
                                <div
                                    className="break-words"
                                    key={`${chat.timestamp}-${chat.username}`}
                                >
                                    <span className="text-red-500">
                                        {timestampWithUsername}
                                    </span>{" "}
                                    {chat.text}
                                </div>
                            );
                    }
                })}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
};