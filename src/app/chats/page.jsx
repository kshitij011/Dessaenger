"use client";

import React, { useState, useEffect } from "react";
import { useWallet } from "@/app/contexts/WalletContext";
import { Client } from "@xmtp/browser-sdk";

export default function Chats() {
    const { account, ethSigner, connectWallet, isConnecting } = useWallet();

    const xmtpInit = async () => {
        if (!account || !ethSigner) return;
        const identifier = {
            type: "EOA",
            identifier: account,
            identifierKind: "Ethereum",
        };

        const signer = {
            // new XMTP MLS format
            getIdentifier: async () => ({
                identifier: {
                    type: "EVM", // or "Ethereum"
                    identifier: account,
                },
            }),
            signMessage: async (message) =>
                await ethSigner.signMessage(message),
        };

        // console.log("Signer", signer);

        try {
            const client = await Client.create(signer, { env: "dev" });
            console.log("Client: ", client);

            const response = await Client.canMessage(account);
            console.log("Response: ", response);
        } catch (err) {
            console.error("XMTP init error:", err);
            alert("XMTP failed to initialize. Check browser settings.");
        }
    };

    useEffect(() => {
        if (account && ethSigner) {
            xmtpInit();
        }
    }, [account, ethSigner]);

    return (
        <>
            <div className="bg-black text-white">This is chats page</div>
        </>
    );
}
