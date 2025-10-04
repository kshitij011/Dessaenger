"use client";

import React, { useState, useEffect } from "react";
import { useWallet } from "@/app/contexts/WalletContext";
import { Client } from "@xmtp/xmtp-js";

export default function Chats() {
    const { account, signer, connectWallet, isConnecting } = useWallet();

    const [xmtpClient, setXmtpClient] = useState(null);
    const [recipientAddress, setRecipientAddress] = useState("");
    const [message, setMessage] = useState("");
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    // Initialize XMTP client after wallet is connected
    const initXmtp = async () => {
        if (!window.ethereum) return alert("MetaMask not found");
        if (!account) return alert("Please connect wallet first");

        try {
            console.log("Signer:", await signer.getAddress());
            console.log("Current account:", account);

            const client = await Client.create(signer, { env: "dev" });

            console.log("✅ XMTP client initialized:", client.address);

            setXmtpClient(client);
            console.log("Rendering — xmtpClient:", xmtpClient);
        } catch (err) {
            console.error("XMTP init error:", err);
            alert(`XMTP init failed: ${err.message}`);
        }
    };

    // Start conversation with a recipient
    // Start conversation with a recipient
    const startConversation = async () => {
        if (!xmtpClient) return alert("Initialize XMTP first");
        if (!recipientAddress) return alert("Enter recipient address");

        setLoading(true);
        try {
            const conv = await xmtpClient.conversations.newConversation(
                recipientAddress
            );
            setConversation(conv);

            const existingMessages = await conv.messages();
            setMessages(existingMessages);
            listenForNewMessages(conv);
        } catch (err) {
            console.error("Error starting conversation:", err);
        } finally {
            setLoading(false);
        }
    };

    // Listen for new messages
    const listenForNewMessages = async (conv) => {
        for await (const msg of await conv.streamMessages()) {
            setMessages((prev) => [...prev, msg]);
        }
    };

    // Send a message
    const sendMessage = async () => {
        if (!conversation || !message) return;
        try {
            await conversation.send(message);
            setMessages((prev) => [
                ...prev,
                { content: message, senderAddress: account },
            ]);
            setMessage("");
        } catch (err) {
            console.error("Send message error:", err);
        }
    };

    useEffect(() => {
        if (xmtpClient) {
            console.log("🎯 XMTP client is ready:", xmtpClient.address);
        }
    }, [xmtpClient]);

    useEffect(() => {
        console.log("🎯 XMTP state changed:", xmtpClient);
    }, [xmtpClient]);

    useEffect(() => {
        if (xmtpClient) {
            console.log("🎯 XMTP client is ready:", xmtpClient.address);
        }
    }, [xmtpClient]);

    return (
        <div className="p-4 flex flex-col items-center">
            <h1 className="text-2xl font-semibold mb-4">
                💬 Decentralized Chat
            </h1>

            {!account ? (
                <button
                    onClick={connectWallet}
                    disabled={isConnecting}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    {isConnecting ? "Connecting..." : "Connect Wallet"}
                </button>
            ) : !xmtpClient ? (
                <button
                    onClick={initXmtp}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                    Initialize XMTP
                </button>
            ) : (
                <>
                    {/* Recipient input */}
                    {!conversation ? (
                        <div className="flex flex-col items-center gap-2">
                            <input
                                type="text"
                                placeholder="Enter recipient address (0x...)"
                                value={recipientAddress}
                                onChange={(e) =>
                                    setRecipientAddress(e.target.value)
                                }
                                className="border px-3 py-2 rounded w-80"
                            />
                            <button
                                onClick={startConversation}
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                                disabled={loading}
                            >
                                {loading ? "Starting..." : "Start Conversation"}
                            </button>
                        </div>
                    ) : (
                        <div className="w-full max-w-lg mt-4 flex flex-col border rounded-lg p-4 shadow">
                            <div className="text-sm text-gray-600 mb-2">
                                Chatting with: {recipientAddress}
                            </div>
                            <div className="flex-1 h-64 overflow-y-auto border rounded p-2 bg-gray-50">
                                {messages.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={`mb-2 p-2 rounded-lg max-w-[80%] ${
                                            msg.senderAddress === account
                                                ? "bg-blue-500 text-white self-end ml-auto"
                                                : "bg-gray-200 text-black"
                                        }`}
                                    >
                                        {msg.content}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-2 flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Type message..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="border flex-1 px-3 py-2 rounded"
                                />
                                <button
                                    onClick={sendMessage}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
