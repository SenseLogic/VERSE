import ChatBox from "../islands/ChatBox.jsx";

export default function App( { Component } )
{
    return (
        <html>
            <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>verse-project</title>
                <link rel="stylesheet" href="/styles.css" />
            </head>
            <body>
                <Component />
                <ChatBox />
            </body>
        </html>
        );
}
