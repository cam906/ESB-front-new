// app/amplify-client-config.tsx
"use client";

import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import { getBackendBaseUrl } from "./lib/backend";

// The Authenticator.Provider makes authentication state globally available
export default function AuthenticatorProvider({ children }: { children: React.ReactNode; }) {
  // Configure Amplify once, using the generated outputs file
  Amplify.configure(({
    Auth: {
      Cognito: {
        userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ?? "",
        userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID ?? "",
        // Optional, but highly recommended for most scenarios
        identityPoolId: process.env.NEXT_PUBLIC_IDENTITY_POOL_ID ?? "",
        loginWith: {
          oauth: {
            domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN ?? "",
            scopes: ["openid", "email", "phone"],
            redirectSignIn: [getBackendBaseUrl()],
            redirectSignOut: [getBackendBaseUrl()],
            responseType: "code",
          },
        },
      },
    },
  }));

  return <Authenticator.Provider>{children}</Authenticator.Provider>;
}