import React from 'react'
import { Route } from 'react-router-dom'
import AdminDashboards from '../dashboards/AdminDashboards'

const DashboardRouting = () => {
  return (
    <>
     <Route path="dashboard" element={<AdminDashboards />} />
    </>
  )
}

export default DashboardRouting