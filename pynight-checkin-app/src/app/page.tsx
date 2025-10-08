'use client';

import { useState } from 'react';
// Correctly import the Scanner component and its types
import type { IDetectedBarcode } from '@yudiel/react-qr-scanner';
import { Scanner } from '@yudiel/react-qr-scanner';

// --- UPDATED INTERFACES ---
// This now matches the `data` object returned by the API
interface AttendeeInfo {
  name: string;
  ticketTypes: string[];
}

// These are the possible states for our UI
type ResultStatus =
  | 'idle'
  | 'success'
  | 'error_not_found'
  | 'error_redeemed' // This is for the "warning" status from the backend
  | 'error_time'
  | 'error_server';

// The result object now includes optional 'details' and a typed 'data' field
interface VerificationResult {
  status: ResultStatus;
  data?: AttendeeInfo;
  message?: string;
  details?: string; // New field for detailed error info
}

// --- Reusable Overlay Components ---

const LoadingOverlay = () => (
  <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50'>
    <p className='text-2xl text-white font-bold animate-pulse'>Verifying...</p>
  </div>
);

// --- UPDATED ResultOverlay to show more details ---
const ResultOverlay = ({
  result,
  onReset,
}: {
  result: VerificationResult;
  onReset: () => void;
}) => {
  let bgColor = 'bg-gray-900 bg-opacity-80';
  let textColor = 'text-white';
  let content = null;

  // A helper component to display attendee info consistently
  const AttendeeInfoDisplay = ({ data }: { data?: AttendeeInfo }) =>
    data ? (
      <div className='mt-3 w-full max-w-sm rounded-lg bg-white bg-opacity-20 p-3 text-left text-sm text-black'>
        <p>
          <span className='font-semibold'>Name:</span> {data.name}
        </p>
        <p>
          <span className='font-semibold'>Tickets:</span>
        </p>
        <ul className='list-disc list-inside ml-4'>
          {data.ticketTypes.map((type, index) => (
            <li key={index}>{type}</li>
          ))}
        </ul>
      </div>
    ) : null;

  switch (result.status) {
    case 'success':
      bgColor = 'bg-green-500 bg-opacity-95';
      content = (
        <>
          <div className='text-6xl mb-4'>✅</div>
          <h2 className='text-4xl font-bold'>VALID</h2>
          <AttendeeInfoDisplay data={result.data} />
        </>
      );
      break;

    case 'error_redeemed':
      bgColor = 'bg-yellow-500 bg-opacity-95';
      textColor = 'text-black';
      content = (
        <>
          <div className='text-6xl mb-4'>⚠️</div>
          <h2 className='text-3xl font-bold'>
            {result.message || 'ALREADY CHECKED-IN'}
          </h2>
          {result.details && (
            <p className='mt-2 text-lg font-medium'>{result.details}</p>
          )}
          <AttendeeInfoDisplay data={result.data} />
        </>
      );
      break;

    case 'error_time':
      bgColor = 'bg-orange-500 bg-opacity-95';
      textColor = 'text-black';
      content = (
        <>
          <div className='text-6xl mb-4'>🕒</div>
          <h2 className='text-3xl font-bold'>
            {result.message || 'WRONG TIME'}
          </h2>
          {result.details && (
            <p className='mt-2 text-lg font-medium'>{result.details}</p>
          )}
          <AttendeeInfoDisplay data={result.data} />
        </>
      );
      break;

    default: // Covers not_found and server_error
      bgColor = 'bg-red-600 bg-opacity-95';
      content = (
        <>
          <div className='text-6xl mb-4'>❌</div>
          <h2 className='text-3xl font-bold'>INVALID</h2>
          <p className='mt-2 text-lg font-medium text-center'>
            {result.message}
          </p>
        </>
      );
      break;
  }

  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center p-2 text-center ${bgColor} ${textColor}`}
    >
      {content}
      <button
        onClick={onReset}
        className='mt-4 px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white'
      >
        Scan Next Ticket
      </button>
    </div>
  );
};

export default function Home() {
  const [result, setResult] = useState<VerificationResult>({ status: 'idle' });
  const [isLoading, setIsLoading] = useState(false);

  // --- UPDATED handleScan logic ---
  const handleScan = async (detectedCodes: IDetectedBarcode[]) => {
    if (isLoading || detectedCodes.length === 0) {
      return;
    }

    const barcode = detectedCodes[0].rawValue;
    setIsLoading(true);

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode }),
      });

      const data = await response.json();

      // We now check the 'status' field inside the JSON response
      // to determine the outcome, as some errors (like 'warning')
      // can come with a 200 OK HTTP status.

      if (data.status === 'success') {
        setResult({ status: 'success', data: data.data });
      } else if (data.status === 'warning') {
        // This is the "Already Redeemed" case
        setResult({
          status: 'error_redeemed',
          message: data.message,
          details: data.details,
          data: data.data,
        });
      } else if (data.status === 'error') {
        // Handle all other errors based on HTTP status code
        switch (response.status) {
          case 403: // Forbidden / Wrong Time
            setResult({
              status: 'error_time',
              message: data.message,
              details: data.details,
              data: data.data,
            });
            break;
          case 404: // Not Found
            setResult({ status: 'error_not_found', message: data.message });
            break;
          default: // 500 or other server errors
            setResult({
              status: 'error_server',
              message: data.message || 'An unknown server error occurred.',
            });
            break;
        }
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      setResult({
        status: 'error_server',
        message: 'Network Error: Could not connect to the server.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetScanner = () => setResult({ status: 'idle' });

  return (
    <main className='flex min-h-screen flex-col items-center justify-center p-4 bg-gray-200'>
      <div className='w-full max-w-md mx-auto bg-white rounded-lg shadow-2xl overflow-hidden'>
        <div className='p-6 border-b'>
          <h1 className='text-2xl font-bold text-center text-gray-800'>
            Event Check-in Scanner
          </h1>
        </div>

        <div className='w-full min-h-80 h-fit bg-gray-900 relative'>
          <Scanner
            onScan={handleScan}
            onError={error =>
              console.error('Scanner Error:', (error as any)?.message)
            }
            paused={isLoading || result.status !== 'idle'}
            constraints={{ facingMode: 'environment' }}
            styles={{
              container: { width: '100%', height: '100%', paddingTop: '0' },
              video: { width: '100%', height: '100%', objectFit: 'cover' },
            }}
          />
          {isLoading && <LoadingOverlay />}
          {result.status !== 'idle' && !isLoading && (
            <ResultOverlay result={result} onReset={resetScanner} />
          )}
        </div>
        <div className='p-4 bg-gray-100 text-center text-sm text-gray-600'>
          <p>Point the camera at a QR code.</p>
        </div>
      </div>
    </main>
  );
}
