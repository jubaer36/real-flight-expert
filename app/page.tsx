import Image from "next/image";

export default function Home() {
  return (
    <>
      <title>Flight Expert</title>
      <main className="min-h-screen flex items-center justify-center bg-gray-800 p-4">
        <div className="w-full max-w-4xl bg-gray-900 rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="flex items-center bg-gray-800 rounded-md px-3 py-2">
                <span className="text-gray-400 mr-2 text-lg" style={{ fontFamily: 'sans-serif' }}>⇄</span>
                <span className="text-white">Round trip</span>
                <span className="text-gray-400 ml-2 text-xs">▼</span>
              </div>
              
              <div className="flex items-center bg-gray-800 rounded-md px-3 py-2">
                <span className="text-gray-400 mr-2 text-lg" style={{ fontFamily: 'sans-serif' }}>👤</span>
                <span className="text-white">1</span>
                <span className="text-gray-400 ml-2 text-xs">▼</span>
              </div>
              
              <div className="flex items-center bg-gray-800 rounded-md px-3 py-2">
                <span className="text-white">Economy</span>
                <span className="text-gray-400 ml-2 text-xs">▼</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="relative flex items-center bg-gray-800 rounded-md p-4">
                <div className="mr-3 text-gray-400">
                  <span className="text-lg" style={{ fontFamily: 'sans-serif' }}>📍</span>
                </div>
                <input type="text" className="w-full bg-transparent text-white outline-none" placeholder="Dhaka" defaultValue="Dhaka" />
              </div>
              
              <div className="relative flex items-center bg-gray-800 rounded-md p-4">
                <div className="mr-3 text-gray-400">
                  <span className="text-lg" style={{ fontFamily: 'sans-serif' }}>📍</span>
                </div>
                <input type="text" className="w-full bg-transparent text-white outline-none" placeholder="New Delhi" defaultValue="New Delhi" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative flex items-center bg-gray-800 rounded-md p-4">
                <div className="mr-3 text-gray-400">
                  <span className="text-lg" style={{ fontFamily: 'sans-serif' }}>📅</span>
                </div>
                <input type="text" className="w-full bg-transparent text-white outline-none" placeholder="Departure" defaultValue="Departure" />
              </div>
              
              <div className="relative flex items-center bg-gray-800 rounded-md p-4">
                <div className="mr-3 text-gray-400">
                  <span className="text-lg" style={{ fontFamily: 'sans-serif' }}>📅</span>
                </div>
                <input type="text" className="w-full bg-transparent text-white outline-none" placeholder="Return" defaultValue="Return" />
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button className="bg-blue-400 hover:bg-blue-500 text-white font-medium py-2 px-6 rounded-full flex items-center">
              <span className="text-lg mr-2" style={{ fontFamily: 'sans-serif' }}>🔍</span>
              Search
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
