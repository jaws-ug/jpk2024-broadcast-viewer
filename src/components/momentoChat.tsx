"use client";
import { useEffect, useRef, useState } from "react";
import { Description, Field, Label, Select } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
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
        <div className="grid grid-cols-5 p-4 m-0 text-center h-[250px] overflow-auto bg-gray-700 text-white">
            <div className="col-span-1">
                <div className="max-w-md px-4">
                    <Field>
                        <div className="flex flex-col items-center">
                            <Label className="text-sm/6 font-medium text-white mb-1.5">Language</Label>
                            <div className="relative w-1/2">
                                <Select
                                    className={clsx(
                                        'block w-full appearance-none rounded-lg border-none bg-white/1 py-1.5 px-3 text-sm/6 text-black pr-10',
                                        'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25',
                                        '*:text-black'
                                    )}
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
                aaaa
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