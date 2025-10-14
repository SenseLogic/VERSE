let chatboxMessageCountByIpMap = new Map();

function getTodayKey()
{
    return new Date().toISOString().slice( 0, 10 ); // YYYY-MM-DD
}

function getDailyLimit()
{
    let fromEnv = Deno.env.get( "CHATBOX_DAILY_MESSAGE_LIMIT" );
    let parsed = fromEnv ? Number.parseInt( fromEnv, 10 ) : NaN;

    return Number.isFinite( parsed ) && parsed > 0 ? parsed : 20;
}

export function getClientIp( req )
{
    let headers = req.headers;
    let xForwardedFor = headers.get( "x-forwarded-for" );

    if ( xForwardedFor )
    {
        // Use the first IP in the list
        let firstIp = xForwardedFor.split( "," )[0].trim();
        if ( firstIp ) return firstIp;
    }

    let realIp = headers.get( "x-real-ip" ) || headers.get( "cf-connecting-ip" );

    if ( realIp ) return realIp;

    return "127.0.0.1";
}

function getAndMaybeResetCounter( ip )
{
    let todayKey = getTodayKey();
    let countByIp = chatboxMessageCountByIpMap.get( ip );

    if ( !countByIp || countByIp.date !== todayKey )
    {
        let counterForDay = { date: todayKey, count: 0 };
        chatboxMessageCountByIpMap.set( ip, counterForDay );
        return counterForDay;
    }

    return countByIp;
}

export function isAllowedAndIncrement( ip )
{
    let limit = getDailyLimit();
    let counter = getAndMaybeResetCounter( ip );

    if ( counter.count >= limit )
    {
        return { allowed: false, remaining: 0, limit };
    }

    counter.count += 1;

    return { allowed: true, remaining: Math.max( 0, limit - counter.count ), limit };
}

export function getRemainingForIp( ip )
{
    let limit = getDailyLimit();
    let counter = getAndMaybeResetCounter( ip );

    return { remaining: Math.max( 0, limit - counter.count ), limit };
}


