import React from 'react'
import ScrollExperience from './ScrollExperience'
import Navbar from '../navbar/navBar'

function LandingPage() {
  return (
    <div>
        <Navbar name="FitMom Club" currentPath="/" />
      <ScrollExperience/>
    </div>
  )
}

export default LandingPage
