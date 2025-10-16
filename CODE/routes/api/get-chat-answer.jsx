import { getChatAnswer } from "../../services/ai_service.js";
import { getClientIp, isAllowedAndIncrement } from "../../services/throttling_service.js";

export default async function handler( ctx )
{
    if ( ctx.req.method !== "POST" )
    {
        return new Response( "Method not allowed", { status: 405 } );
    }

    try
    {
        let body = await ctx.req.json();
        let { sessionId, visitorMessage } = body;

        if ( !sessionId || !visitorMessage )
        {
            return new Response(
                JSON.stringify(
                    {
                        statusCode: 400,
                        error: "Missing sessionId or visitorMessage"
                    }
                    ),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                }
                );
        }

        let clientIp = getClientIp( ctx.req );
        let { allowed, remaining, limit } = isAllowedAndIncrement( clientIp );

        if ( !allowed )
        {
            let polite = `You've reached today's chat limit (${limit} messages). Please use our contact form and we'll get back to you personally.`;

            return new Response(
                JSON.stringify(
                    {
                        statusCode: 429,
                        botMessage: polite,
                        limit: limit,
                        remaining: remaining
                    }
                    ),
                {
                    status: 200,
                    headers: { "Content-Type": "application/json" }
                }
                );
        }

        let botMessage = await getChatAnswer( sessionId, visitorMessage );

        return new Response(
            JSON.stringify(
                {
                    statusCode: 200,
                    botMessage: botMessage,
                    limit: limit,
                    remaining: remaining
                }
                ),
            {
                headers: { "Content-Type": "application/json" }
            }
            );
    }
    catch ( error )
    {
        console.error( "Error getting chat answer:", error );

        return new Response(
            JSON.stringify(
                {
                    statusCode: 500,
                    error: "Failed to get chat answer"
                }
                ),
            {
                status: 500,
                headers: { "Content-Type": "application/json" }
            }
            );
    }
}
