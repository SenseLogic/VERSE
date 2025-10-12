import { useSignal, useSignalEffect } from "@preact/signals";

export default function ChatBox( props )
{
    const isOpen = useSignal( false );
    const sessionId = useSignal( null );
    const messages = useSignal( [] );
    const inputValue = useSignal( "" );
    const isLoading = useSignal( false );

    const openChat = async () =>
    {
        try
        {
            isLoading.value = true;
            const response = await fetch(
                "/api/open-chat-session",
                {
                    method: "POST",
                    headers:
                        {
                            "Content-Type": "application/json",
                        },
                }
                );

            if ( response.ok )
            {
                const data = await response.json();
                sessionId.value = data.sessionId;
                messages.value = [
                    {
                        role: "assistant",
                        content: data.botMessage,
                        timestamp: new Date()
                    }
                ];
                isOpen.value = true;
            }
            else
            {
                console.error( "Failed to open chat session" );
            }
        }
        catch ( error )
        {
            console.error( "Error opening chat:", error );
        }
        finally
        {
            isLoading.value = false;
        }
    };

    const closeChat = async () =>
    {
        if ( sessionId.value )
        {
            try
            {
                await fetch(
                    "/api/close-chat-session",
                    {
                        method: "POST",
                        headers:
                            {
                                "Content-Type": "application/json",
                            },
                        body: JSON.stringify(
                            {
                                sessionId: sessionId.value
                            }
                            ),
                    }
                    );
            }
            catch ( error )
            {
                console.error( "Error closing chat session:", error );
            }
        }

        isOpen.value = false;
        sessionId.value = null;
        messages.value = [];
        inputValue.value = "";
    };

    const sendMessage = async () =>
    {
        if ( !inputValue.value.trim() || !sessionId.value || isLoading.value )
        {
            return;
        }

        const userMessage = inputValue.value.trim();
        inputValue.value = "";

        messages.value = [
            ...messages.value,
            {
                role: "user",
                content: userMessage,
                timestamp: new Date()
            }
        ];

        try
        {
            isLoading.value = true;
            const response = await fetch(
                "/api/get-chat-answer",
                {
                    method: "POST",
                    headers:
                        {
                            "Content-Type": "application/json",
                        },
                    body: JSON.stringify(
                        {
                            sessionId: sessionId.value,
                            visitorMessage: userMessage,
                        }
                        ),
                }
                );

            if ( response.ok )
            {
                const data = await response.json();
                messages.value = [
                    ...messages.value,
                    {
                        role: "assistant",
                        content: data.botMessage,
                        timestamp: new Date()
                    }
                ];
            }
            else
            {
                console.error( "Failed to get chat answer" );
                messages.value = [
                    ...messages.value,
                    {
                        role: "assistant",
                        content: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
                        timestamp: new Date()
                    }
                ];
            }
        }
        catch ( error )
        {
            console.error( "Error sending message:", error );
            messages.value = [
                ...messages.value,
                {
                    role: "assistant",
                    content: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
                    timestamp: new Date()
                }
            ];
        }
        finally
        {
            isLoading.value = false;
        }
    };

    const handleKeyPress = ( e ) =>
    {
        if ( e.key === "Enter" && !e.shiftKey )
        {
            e.preventDefault();
            sendMessage();
        }
    };

    useSignalEffect(
        () =>
        {
            if ( messages.value.length > 0 )
            {
                const messagesContainer = document.getElementById( "chat-messages" );
                if ( messagesContainer )
                {
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }
            }
        }
        );

    return (
        <div class={`chatbox ${props.class || ""}`}>
            {!isOpen.value ? (
                <button
                    type="button"
                    onClick={openChat}
                    disabled={isLoading.value}
                    class="chatbox-button"
                    title="Open chat"
                >
                    {isLoading.value ? (
                        <svg class="chatbox-button-image chatbox-spinner" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg class="chatbox-button-image" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                        </svg>
                    )}
                </button>
            ) : (
                <div class="chatbox-widget">
                    <div class="chatbox-widget-header">
                        <h3>Chat with us</h3>
                        <button
                            type="button"
                            onClick={closeChat}
                            class="chatbox-widget-close-button"
                            title="Close chat"
                        >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>

                    <div
                        id="chat-messages"
                        class="chatbox-widget-message-container"
                    >
                        {messages.value.map((message, index) => (
                            <div
                                key={index}
                                class={`chatbox-widget-message ${message.role}`}
                            >
                                <div class="chatbox-widget-message-content">
                                    {message.content}
                                </div>
                            </div>
                        ))}
                        {isLoading.value && (
                            <div class="chatbox-widget-loading">
                                <div class="chatbox-widget-loading-content">
                                    <div class="chatbox-widget-loading-dots">
                                        <div class="chatbox-widget-loading-dot"></div>
                                        <div class="chatbox-widget-loading-dot"></div>
                                        <div class="chatbox-widget-loading-dot"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div class="chatbox-widget-input-container">
                        <div class="chatbox-widget-input-wrapper">
                            <textarea
                                value={inputValue.value}
                                onInput={ ( e ) => inputValue.value = e.target.value }
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                disabled={isLoading.value}
                                class="chatbox-widget-input"
                                rows="1"
                            />
                            <button
                                type="button"
                                onClick={sendMessage}
                                disabled={!inputValue.value.trim() || isLoading.value}
                                class="chatbox-widget-send-button"
                                title="Send message"
                            >
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
