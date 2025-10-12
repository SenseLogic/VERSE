import { getChatAnswer } from "../../ai_service.js";

export default async function handler( ctx )
{
    if ( ctx.req.method !== "POST" )
    {
        return new Response( "Method not allowed", { status: 405 } );
    }

    try
    {
        const body = await ctx.req.json();
        const { sessionId, visitorMessage } = body;

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

        const botMessage = await getChatAnswer( sessionId, visitorMessage );

        return new Response(
            JSON.stringify( 
                {
                    statusCode: 200,
                    botMessage: botMessage
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
