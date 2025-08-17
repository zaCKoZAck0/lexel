import { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github"

export default {
    providers: [
        GitHub,
    ],
} as NextAuthConfig;