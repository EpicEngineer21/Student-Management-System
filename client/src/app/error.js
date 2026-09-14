'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Caught by error boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="bg-red-50 text-red-800 p-6 rounded-lg max-w-xl w-full">
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <p className="font-mono text-sm break-all">{error?.message}</p>
        <button
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          onClick={() => reset()}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
