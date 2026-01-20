import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import React from 'react'
import Upload from './components/heroSection/Upload'
import DesignTemplate from './components/heroSection/DesignTemplate'
import EmailConfig from './components/heroSection/EmailConfig'
// import PreviewAndConfig from './components/heroSection/PreviewAndConfig'

function App() {


  return (
    <div className='bg-gray-200 min-h-screen'>
      <div className='font-roboto text-4xl pt-6 px-7 font-bold'>AutoCerts</div>
      <div className='text-md text-gray-600 py-2.5 px-7'>Upload Excel data, customize templates, and send personalized certificates or ID cards via email</div>
      <Navbar/>
      {/* <HeroSection/> */}

      {/* <div className="flex flex-col md:flex-row justify-center gap-4 px-7">
      <Upload/>
      <DesignTemplate/>
      </div> */}

      <div className="flex flex-col md:flex-row justify-center gap-4 px-7">
       <EmailConfig/>
       {/* <PreviewAndConfig/> */}
       </div>
    </div>
  )
}

export default App
