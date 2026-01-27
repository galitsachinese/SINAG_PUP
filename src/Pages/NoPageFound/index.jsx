import React from 'react';
import { Link } from 'react-router-dom';

const NoPageFound = () => {
  return (
    <div className='min-h-screen flex flex-col justify-center items-center bg-gray-100 dark:bg-gray-900 px-4 py-12'>
      <div className='text-center'>
        <h1 className='text-6xl font-bold text-gray-800 dark:text-white'>404</h1>
        <p className='text-xl mt-4 text-gray-600 dark:text-gray-300'>Oops! Page not found.</p>
        <p className='text-sm text-gray-500 dark:text-gray-400 mt-2'>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to='/pup-sinag'
          className='inline-block mt-6 px-6 py-3 bg-red-900 text-white rounded hover:bg-red-700 transition'
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NoPageFound;
