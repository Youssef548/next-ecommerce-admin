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
          {session.user?.image && (
            <Image
              src={session.user.image}
              alt="User Avatar"
              width={40}
              height={40}
              className="rounded-full"
            />
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
