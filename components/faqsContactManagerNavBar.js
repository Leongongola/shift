"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

/**
 * SupportNavBar Component
 *
 * This component renders a navigation bar with a title and a link back to the Worker Profile page.
 * It uses the Next.js Link component for client-side navigation.
 *
 * @returns {JSX.Element} The SupportNavBar component
 */
const SupportNavBar = () => {
  const searchParams = useSearchParams();
  const managerId = searchParams.get("managerId");
  const firstName = searchParams.get("firstName");
  const lastName = searchParams.get("lastName");

  const backToWorkerProfileLink = `/punchInOut?managerId=${managerId}&firstName=${firstName}&lastName=${lastName}`;

  return (
    <nav className="bg-gradient-to-r from-blue-300 via-blue-600 to-blue-800 b-8text-white py-3 w-full">
      <div className="flex justify-between items-center px-4">
        <div className="text-3xl font-bold">ShiftEaze</div>
        <div className="flex space-x-6 items-center">
          <Link
            href={backToWorkerProfileLink}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md inline-block shadow-md  border-2 border-transparent hover:border-gray-400"
          >
            Back to Worker Profile
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default SupportNavBar;
