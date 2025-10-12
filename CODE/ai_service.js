const chatSessions = new Map();

let companyInfo = [];

export async function loadCompanyInfo()
{
    try
    {
        const fileContent = await Deno.readTextFile( "company_information.json" );
        companyInfo = JSON.parse( fileContent );
    }
    catch ( error )
    {
        console.error( "Failed to load company information:", error );
        companyInfo = [];
    }
}

await loadCompanyInfo();

export function createChatSession()
{
    const sessionId = crypto.randomUUID();
    const session =
        {
            id: sessionId,
            messages: [],
            createdAt: new Date(),
        };

    chatSessions.set( sessionId, session );
    return session;
}

export function getChatSession( sessionId )
{
    return chatSessions.get( sessionId );
}

export function closeChatSession( sessionId )
{
    return chatSessions.delete( sessionId );
}

export async function getChatAnswer( sessionId, userMessage )
{
    const session = getChatSession( sessionId );
    if ( !session )
    {
        throw new Error( "Session not found" );
    }

    session.messages.push(
        {
            role: "user",
            content: userMessage
        }
        );

    const systemPrompt = `You are a helpful AI assistant for a company website. You have access to the following company information:

${companyInfo.map( info => `URL: ${info.url}\nContent: ${info.text}` ).join( '\n\n' )}

Please answer questions about the company, its products, services, team, and contact information based on the provided information. If asked about something not covered in the company information, politely decline and suggest using the website's contact form for additional inquiries.

Keep your responses helpful, professional, and concise.`;

    const messages = [
        {
            role: "system",
            content: systemPrompt
        },
        ...session.messages
    ];

    try
    {
        const openRouterApiKey = Deno.env.get( "OPENROUTER_API_KEY" );
        if ( !openRouterApiKey )
        {
            throw new Error( "OPENROUTER_API_KEY environment variable not set" );
        }

        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",
                headers:
                    {
                        "Authorization": `Bearer ${openRouterApiKey}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://example.com",
                        "X-Title": "Company Chatbot",
                    },
                body: JSON.stringify(
                    {
                        model: "meta-llama/llama-3.3-8b-instruct:free",
                        messages: messages,
                        max_tokens: 500,
                        temperature: 0.7,
                    }
                    ),
            }
            );

        if ( !response.ok )
        {
            throw new Error( `OpenRouter API error: ${response.status} ${response.statusText}` );
        }

        const data = await response.json();
        const botMessage = data.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

        session.messages.push(
            {
                role: "assistant",
                content: botMessage
            }
            );

        return botMessage;
    }
    catch ( error )
    {
        console.error( "Error getting chat answer:", error );
        const errorMessage = "I'm sorry, I'm having trouble processing your request right now. Please try again later or use our contact form.";
        session.messages.push(
            {
                role: "assistant",
                content: errorMessage
            }
            );

        return errorMessage;
    }
}
