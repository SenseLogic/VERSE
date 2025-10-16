import { createChatSession } from "../../services/ai_service.js";
import { getClientIp, getRemainingForIp } from "../../services/throttling_service.js";

export default async function handler( ctx )
{
    if ( ctx.req.method !== "POST" )
    {
        return new Response( "Method not allowed", { status: 405 } );
    }

    try
    {
        let session = createChatSession();
        let botMessage = "Hello! I'm here to help you learn more about our company. You can ask me about our products, services, team, or contact information. How can I assist you today?";

        return new Response(
            JSON.stringify(
                {
                    statusCode: 200,
                    sessionId: session.id,
                    botMessage: botMessage,
                    ...(() => { let { remaining, limit } = getRemainingForIp( getClientIp( ctx.req ) ); return { limit, remaining }; })()
                }
                ),
            {
                headers: { "Content-Type": "application/json" }
            }
            );
    }
    catch ( error )
    {
        console.error( "Error creating chat session:", error );

        return new Response(
            JSON.stringify(
                {
                    statusCode: 500,
                    error: "Failed to create chat session"
                }
                ),
            {
                status: 500,
                headers: { "Content-Type": "application/json" }
            }
            );
    }
}
