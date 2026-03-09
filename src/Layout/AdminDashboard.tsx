import React from 'react'
import Sidebar from '../Components/Sidebar/Sidebar.tsx'
import Header from '../Components/Header/Header.tsx'
import { Outlet } from 'react-router-dom'

const AdminDashboard = () => {
    return (
        <div className='flex '>
            <Sidebar />
            <div className='w-full flex flex-col'>
                <Header />
                <Outlet />
            </div>
        </div>
    )
}

export default AdminDashboard
