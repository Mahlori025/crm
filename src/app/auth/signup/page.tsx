// // src/app/auth/signup/page.tsx
// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import Image from 'next/image';

// export default function SignUpPage() {
//   const router = useRouter();
  
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: '',
//     confirmPassword: ''
//   });
  
//   const [error, setError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
  
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };
  
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     // Basic validation
//     if (!formData.name || !formData.email || !formData.password) {
//       setError('All fields are required');
//       return;
//     }
    
//     if (formData.password !== formData.confirmPassword) {
//       setError('Passwords do not match');
//       return;
//     }
    
//     // For development purposes, just redirect to dashboard
//     setIsLoading(true);
    
//     // Simulate API call delay
//     setTimeout(() => {
//       // In production, this would be a real API call to create user
//       console.log('User registration data:', formData);
//       router.push('/dashboard');
//     }, 1000);
//   };
  
//   return (
//     <div className="landing-container">
//       <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white p-8 rounded-lg shadow-xl">
//         <div className="flex justify-center">
//           <Image
//             src="/images/logo.png"
//             alt="Gibela Logo"
//             width={70}
//             height={70}
//             className="h-14 w-auto"
//           />
//         </div>
//         <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//           Create a new account
//         </h2>

//         <div className="mt-8">
//           <form className="space-y-6" onSubmit={handleSubmit}>
//             {error && (
//               <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
//                 <span className="block sm:inline">{error}</span>
//               </div>
//             )}
            
//             <div>
//               <label htmlFor="name" className="block text-sm font-medium text-gray-700">
//                 Full Name
//               </label>
//               <div className="mt-1">
//                 <input
//                   id="name"
//                   name="name"
//                   type="text"
//                   autoComplete="name"
//                   required
//                   value={formData.name}
//                   onChange={handleChange}
//                   className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                 />
//               </div>
//             </div>
            
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700">
//                 Email address
//               </label>
//               <div className="mt-1">
//                 <input
//                   id="email"
//                   name="email"
//                   type="email"
//                   autoComplete="email"
//                   required
//                   value={formData.email}
//                   onChange={handleChange}
//                   className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                 />
//               </div>
//             </div>

//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700">
//                 Password
//               </label>
//               <div className="mt-1">
//                 <input
//                   id="password"
//                   name="password"
//                   type="password"
//                   autoComplete="new-password"
//                   required
//                   value={formData.password}
//                   onChange={handleChange}
//                   className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                 />
//               </div>
//             </div>
            
//             <div>
//               <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
//                 Confirm Password
//               </label>
//               <div className="mt-1">
//                 <input
//                   id="confirmPassword"
//                   name="confirmPassword"
//                   type="password"
//                   autoComplete="new-password"
//                   required
//                   value={formData.confirmPassword}
//                   onChange={handleChange}
//                   className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                 />
//               </div>
//             </div>

//             <div>
//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
//               >
//                 {isLoading ? 'Creating account...' : 'Sign up'}
//               </button>
//             </div>
//           </form>

//           <div className="mt-6">
//             <div className="relative">
//               <div className="absolute inset-0 flex items-center">
//                 <div className="w-full border-t border-gray-300" />
//               </div>
//               <div className="relative flex justify-center text-sm">
//                 <span className="px-2 bg-white text-gray-500">Already have an account?</span>
//               </div>
//             </div>

//             <div className="mt-6">
//               <Link 
//                 href="/auth/signin"
//                 className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//               >
//                 Sign in
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


// src/app/auth/signup/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function SignUpPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('All fields are required');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // For development purposes, just redirect to dashboard
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // In production, this would be a real API call to create user
      console.log('User registration data:', formData);
      router.push('/dashboard');
    }, 1000);
  };
  
  return (
    <div className="landing-container">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl bg-white bg-opacity-95 p-10 rounded-xl shadow-[0_0_25px_rgba(255,255,255,0.15)] border border-white/30">
        <div className="flex justify-center">
          <Image
            src="/images/logo.png"
            alt="Gibela Logo"
            width={90}
            height={90}
            className="h-20 w-auto"
          />
        </div>
        <h2 className="mt-6 text-center text-4xl font-bold text-gray-800">
          Create a new account
        </h2>
        <p className="mt-2 text-center text-xl text-gray-600">
          Join the Gibela portal
        </p>

        <div className="mt-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </div>
            )}
            
            <div>
              <label htmlFor="name" className="block text-lg font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-2">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg"
                  placeholder="John Doe"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-lg font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-lg font-medium text-gray-700">
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-lg font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-2">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Creating account...' : 'Sign up'}
              </button>
            </div>
          </form>

          <div className="mt-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-base">
                <span className="px-2 bg-white text-gray-600 text-lg">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link 
                href="/auth/signin"
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}