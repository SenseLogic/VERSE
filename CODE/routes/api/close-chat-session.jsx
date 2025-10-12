import { closeChatSession } from "../../ai_service.js";

export default async function handler( ctx )
    {
        if ( ctx.req.method !== "POST" )
        {
            return new Response( "Method not allowed", { status: 405 } );
        }

        try
        {
            const body = await ctx.req.json();
            const { sessionId } = body;

            if ( !sessionId )
            {
                return new Response(
                    JSON.stringify(
                        {
                            statusCode: 400,
                            error: "Missing sessionId"
                        }
                        ),
                    {
                        status: 400,
                        headers: { "Content-Type": "application/json" }
                    }
                    );
            }

            const success = closeChatSession( sessionId );

            return new Response(
                JSON.stringify( 
                    {
                        statusCode: success ? 200 : 404
                    }
                    ),
                {
                    headers: { "Content-Type": "application/json" }
                }
                );
        }
        catch ( error )
        {
            console.error( "Error closing chat session:", error );
            return new Response(
                JSON.stringify( 
                    {
                        statusCode: 500,
                        error: "Failed to close chat session"
                    }
                    ),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" }
                }
                );
        }
    }
