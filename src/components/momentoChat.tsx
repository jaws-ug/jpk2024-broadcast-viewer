"use client";
import { useEffect, useRef, useState } from "react";
import { Field, Label, Select } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import { subscribeToTopic } from "@/utis/momento-web";
import { type TopicItem } from "@gomomento/sdk-web";

export const MomentoChat = () => {
    const [chatList, setChats] = useState<string[]>([]);
    const [latestChat, setLatestChat] = useState<string>("");

    // Momentoキャッシュの名前
    const cacheName = "jpk2024-broadcast-viewer";
    // topicNameは、チャットルームのようなもので今回だと各言語ごとに設定する
    const topicName = "test";

    const onItem = (item: TopicItem) => {
        try {
            const message = item.valueString();
            if (message) {
                setChats((curr) => [...curr, message]);
            }
            setLatestChat(message); // 最新のメッセージを保存
        } catch (e) {
            console.error("unable to parse chat message", e);
        }
    };

    useEffect(() => {
        subscribeToTopic(
            cacheName,
            topicName,
            onItem,
        )
            .catch((e) => console.error("error subscribing to topic", e));
    }, []);


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
                こんにちは。初めまして
                <>
                    {chatList.map((chat, index) => (
                        <div
                            className="break-words"
                            key={`${index}`}
                        >
                            {chat}
                        </div>
                    ))
                    }
                </>
            </div>
        </div>
    );
};