'use client';

import { signIn, signOut, useSession } from 'next-auth/react';

export default function TwitterAut() {
  const { data: session } = useSession();

  return (
    <div>
      {session ? (
        <>
          <p>Welcome, {session.user?.name}</p>
          <button onClick={() => signOut()}>Sign out</button>
        </>
      ) : (
        <button onClick={() => signIn("twitter")}>Sign in with Twitter</button>
      )}
    </div>
  );
}
