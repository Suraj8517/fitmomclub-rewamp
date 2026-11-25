import React from 'react'
import ScrollExperience from './ScrollExperience'
import Navbar from '../navbar/navBar'
import { Route, Routes } from 'react-router-dom'
import OurApp from './ourApp'

function LandingPage() {
  return (
    <div>
      <Navbar name="FitMom Club" currentPath="/" />

      <Routes>
        <Route path="/" element={<ScrollExperience />} />
        <Route path="/our-app" element={<OurApp />} />
      </Routes>
    </div>
  )
}

export default LandingPage