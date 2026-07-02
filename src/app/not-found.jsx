'use client';

import Link from 'next/link';

export default function notFound() {
  return (
    <div className="fixed inset-0 z-50 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col justify-center items-center overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-indigo-300/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-200/30 to-pink-300/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-200/20 to-blue-300/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <div className="space-y-8 mb-12">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-slate-800 via-slate-600 to-slate-800 bg-clip-text text-transparent">
              404
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto"></div>
          </div>

          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-slate-800 leading-tight">
            این صفحه در حال توسعه میباشد
          </h2>

          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            متأسفانه صفحه‌ای که به دنبال آن هستید هنوز آماده نشده است. لطفاً بعداً دوباره تلاش کنید.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            className="group relative w-64 h-16 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold text-lg rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center overflow-hidden"
            href="/"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative flex items-center gap-3">
              <svg
                className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              بازگشت به صفحه اصلی
            </span>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="group w-64 h-16 bg-white/80 backdrop-blur-sm hover:bg-white text-slate-700 hover:text-slate-900 font-semibold text-lg rounded-2xl shadow-lg hover:shadow-xl border border-slate-200/50 hover:border-slate-300 transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
          >
            <span className="flex items-center gap-3">
              <svg
                className="w-5 h-5 transform group-hover:rotate-12 transition-transform duration-300"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              صفحه قبل
            </span>
          </button>
        </div>

        <div className="mt-16 flex justify-center space-x-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <div
            className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"
            style={{ animationDelay: '0.2s' }}
          ></div>
          <div
            className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"
            style={{ animationDelay: '0.4s' }}
          ></div>
        </div>
      </div>
    </div>
  );
}
