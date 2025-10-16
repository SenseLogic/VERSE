export let handler =
    {
        GET( ctx )
        {
            let name = ctx.params.name;

            return new Response(
                `Hello, ${name.charAt(0).toUpperCase() + name.slice(1)}!`,
                );
        },
    };
