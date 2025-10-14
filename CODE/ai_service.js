let chatSessionByIdMap = new Map();

let companyInformationArray = [];

export async function loadCompanyInfo()
{
    try
    {
        let fileContent = await Deno.readTextFile( "company_information.json" );
        companyInformationArray = JSON.parse( fileContent );
    }
    catch ( error )
    {
        console.error( "Failed to load company information:", error );
        companyInformationArray = [];
    }
}

await loadCompanyInfo();

export function createChatSession()
{
    let sessionId = crypto.randomUUID();
    let session =
        {
            id: sessionId,
            messageArray: [],
            createdAt: new Date(),
        };

    chatSessionByIdMap.set( sessionId, session );
    return session;
}

export function getChatSession( sessionId )
{
    return chatSessionByIdMap.get( sessionId );
}

export function closeChatSession( sessionId )
{
    return chatSessionByIdMap.delete( sessionId );
}

export async function getChatAnswer( sessionId, userMessage )
{
    let session = getChatSession( sessionId );
    if ( !session )
    {
        throw new Error( "Session not found" );
    }

    session.messageArray.push(
        {
            role: "user",
            content: userMessage
        }
        );

    let systemPrompt = 
        "You are a helpful AI assistant for a company website. You have access to the following company information:\n\n"
        + `${companyInformationArray.map( companyInformation => `URL: ${companyInformation.url}\nContent: ${companyInformation.text}` ).join( '\n\n' )}\n\n`
        + "Please answer questions about the company, its products, services, team, and contact information based on the provided information. If asked about something not covered in the company information, politely decline and suggest using the website's contact form for additional inquiries.\n\n"
        + "Keep your responses helpful, professional, and concise.";

    let messageArray = [
        {
            role: "system",
            content: systemPrompt
        },
        ...session.messageArray
    ];

    try
    {
        let openRouterApiKey = Deno.env.get( "OPENROUTER_API_KEY" );
        if ( !openRouterApiKey )
        {
            throw new Error( "OPENROUTER_API_KEY environment variable not set" );
        }

        let response = await fetch(
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
                        messages: messageArray,
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

        let data = await response.json();
        let botMessage = data.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

        session.messageArray.push(
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
        let errorMessage = "I'm sorry, I'm having trouble processing your request right now. Please try again later or use our contact form.";
        session.messageArray.push(
            {
                role: "assistant",
                content: errorMessage
            }
            );

        return errorMessage;
    }
}
