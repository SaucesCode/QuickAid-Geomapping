// LandingPage.jsx
import React from "react";
import "./LandingPage.css";
import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="landing-page">
      <header>
        <div className="logo">
          <h1>Your Company</h1>
        </div>
        <nav>
          <ul className="nav-links">
            <li>
              <a href="#home">Home</a>
            </li>
            <li>
              <a href="#services">Services</a>
            </li>
            <li>
              <a href="#about">About</a>
            </li>
            <li>
              <a href="#contact">Contact</a>
            </li>
          </ul>
        </nav>
        <div className="staff-login">
          <button className="login-button" onClick={() => navigate("/login")}>
            Staff Login
          </button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <h2>Welcome to Your Company</h2>
            <p>Your compelling business tagline goes here</p>
            <button className="cta-button">Get Started</button>
          </div>
        </section>

        <section id="services" className="services">
          <h2>Our Services</h2>
          <div className="services-grid">
            <div className="service-card">
              <h3>Service 1</h3>
              <p>Description of your first service offering.</p>
            </div>
            <div className="service-card">
              <h3>Service 2</h3>
              <p>Description of your second service offering.</p>
            </div>
            <div className="service-card">
              <h3>Service 3</h3>
              <p>Description of your third service offering.</p>
            </div>
          </div>
        </section>

        <section id="about" className="about">
          <h2>About Us</h2>
          <p>Information about your company and your mission.</p>
        </section>

        <section id="contact" className="contact">
          <h2>Contact Us</h2>
          <form className="contact-form">
            <input type="text" placeholder="Your Name" />
            <input type="email" placeholder="Your Email" />
            <textarea placeholder="Your Message"></textarea>
            <button type="submit">Send Message</button>
          </form>
        </section>
      </main>

      <footer>
        <p>&copy; 2025 Your Company. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default LandingPage;
