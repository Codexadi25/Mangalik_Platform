import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Hero from '../components/Hero'
import Products from '../components/Products'
import Features from '../components/Features'
import Reviews from '../components/Reviews'
import WhyChooseUs from '../components/WhyChooseUs'
import Contact from '../components/Contact'

const Home = () => {
  const { hash } = useLocation()

  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash.replace('#', ''))
        if (element) {
          const yOffset = -80 // adjust for navbar height if needed
          const y = element.getBoundingClientRect().top + window.scrollY + yOffset
          window.scrollTo({ top: y, behavior: 'smooth' })
        }
      }, 100)
    } else {
      window.scrollTo(0, 0)
    }
  }, [hash])

  return (
    <>
      <section id="home">
        <Hero />
      </section>
      <Products />
      <Features />
      <WhyChooseUs />
      <Reviews />
      <Contact />
    </>
  )
}

export default Home
