import React from 'react'
import Header from '../components/Header'
import FileUpload from '../components/FileUpload'
import PatientTable from '../components/PatientTable'
import PatientDetails from '../components/PatientDetails'

function Dashboard() {
    return (
        <>
            <Header />
            <FileUpload />
            <PatientTable />
            <PatientDetails />
        </>
    )
}

export default Dashboard