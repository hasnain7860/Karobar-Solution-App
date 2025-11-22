import React from 'react';

// Yeh layout (auth) group ke andar hai (login, signup)
// Iska kaam sirf page ko center mein, saaf background par dikhana hai.
export default function AuthLayout({ children }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      {/* Max width, padding, shadow, etc. ab page.js file
        (e.g., signup/page.js) khud handle karegi.
        Iss se humein har page par zyada control milta hai.
      */}
      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-xl">
        {children}
      </div>
    </div>
  );
}


