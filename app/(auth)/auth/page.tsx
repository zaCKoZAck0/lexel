import { auth, signIn } from "@/lib/auth";
import { URLS } from "@/lib/config";
import { redirect } from "next/navigation";

export default async function AuthPage({
    searchParams,
}: {
    searchParams: Promise<{ redirect?: string }>
}) {
    const session = await auth();
    if (session) {
        redirect(URLS.userProfile);
    }

    const { redirect: redirectParam } = await searchParams;

    // Sanitize and validate redirect parameter, default to "/"
    const redirectTo = redirectParam && redirectParam.startsWith('/') ? redirectParam : URLS.defaultRedirect;

    return (
        <form
            action={
                async () => {
                    "use server";
                    await signIn("github", { redirectTo });
                }
            }
        >
            <button>Sign in with GitHub</button>
        </form>
    );
}
