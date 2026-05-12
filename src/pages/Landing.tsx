import { useEffect } from 'react'
import Navbar from '../components/landing/Navbar'
import Hero from '../components/landing/Hero'
import PainPoints from '../components/landing/PainPoints'
import Pillars from '../components/landing/Pillars'
import SocialProof from '../components/landing/SocialProof'
import Footer from '../components/landing/Footer'

export default function Landing() {
  useEffect(() => {
    const previous = document.documentElement.classList.contains('dark')
    document.documentElement.classList.remove('dark')
    return () => {
      if (previous) document.documentElement.classList.add('dark')
    }
  }, [])

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white text-slate-900">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-20 bg-gradient-to-b from-white via-slate-50 to-white"
      />
      <Navbar />
      <main>
        <Hero />
        <PainPoints />
        <Pillars />
        <SocialProof />
      </main>
      <Footer />
    </div>
  )
}
