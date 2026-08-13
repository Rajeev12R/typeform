import React from 'react'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { FeatureCards } from './components/FeatureCards'
import { IntelligentForms } from './components/IntelligentForms'
import { FeaturesGrid } from './components/FeaturesGrid'
import { GrowthFlow } from './components/GrowthFlow'
import { PreFooter } from './components/PreFooter'
import { Footer } from './components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#2a222a] flex flex-col">
      <Navbar />
      <Hero />
      <FeatureCards />
      <IntelligentForms />
      <FeaturesGrid />
      <GrowthFlow />
      <PreFooter />
      <Footer />
    </main>
  )
}