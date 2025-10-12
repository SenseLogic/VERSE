import { Head } from "fresh/runtime";

export default function Home( ctx )
{
    console.log( "Shared value " + ctx.state.shared );

    return (
        <div class="page-container">
            <Head>
                <title>Verse Project</title>
            </Head>
            <div class="page-content">
                <img
                    class="logo"
                    src="/logo.svg"
                    width="128"
                    height="128"
                    alt="the Fresh logo: a sliced lemon dripping with juice"
                />
                <h1 class="page-title">Welcome to Verse Project</h1>
                <p class="page-description">
                    This is a lead generation chatbox website built with Deno Fresh.
                    <br />
                    Try updating this message in the
                    <code class="code-inline">./routes/index.jsx</code> file, and refresh.
                </p>
            </div>
        </div>
    );
}
