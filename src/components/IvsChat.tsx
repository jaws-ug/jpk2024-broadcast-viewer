import { useState, useEffect } from 'react';

export const IvsChat = () => {
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        const chatClientToken ="xxxx";
        const socketUrl = "wss://edge.ivschat.ap-northeast-1.amazonaws.com";
        const connection = new WebSocket(socketUrl, chatClientToken);

        connection.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setMessages((prevMessages) => [...prevMessages, data.Content]);
        };

        return () => {
            connection.close();
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white">
        <div id="received">
          {messages.map((message, index) => (
            <div key={index}>{message}</div>
          ))}
        </div>
      </div>
    );
}
