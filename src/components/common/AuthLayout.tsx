import React from "react";

// Full-page gate layout (admin login, staging PIN): the form card centred on the Cream page.
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-nubb-cream text-nubb-brown selection:bg-nubb-orange selection:text-nubb-cream flex items-center justify-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
