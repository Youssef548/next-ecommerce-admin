"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";

const UserButton = () => {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (session) {
    return (
      <div className="relative">
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          {session.user?.image ? (
            <Image
              src={session.user.image}
              alt="User Avatar"
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              <svg
                className="h-6 w-6 text-gray-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          )}
        </div>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg">
            <button
              className="block w-full px-4 py-2 text-left hover:bg-gray-100"
              onClick={() => signOut()}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    );
  }

  return <button onClick={() => signIn()}>Sign In</button>;
};

export default UserButton;
