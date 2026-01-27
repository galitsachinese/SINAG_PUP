import React from 'react';
import { Outlet } from 'react-router-dom';
import CoordinatorLayout from './CoordinatorLayout';

const DashboardLayout = () => {
  return (
    <>
      <CoordinatorLayout /> 
      <Outlet />
    </>
  );
};

export default DashboardLayout;
