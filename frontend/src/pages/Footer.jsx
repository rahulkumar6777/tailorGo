import React from 'react'
import "../styles/footer.css"
import logo from "../assets/logo.png"
function Footer() {
  return (
   <footer class="footer">
  <div class="footer-container">


    <div class="footer-brand">
      <div class="logo">
            {/* <span class="logo-text">Tailor<span>Go</span></span> */}
            <img src={logo} alt="" />
          </div>
      <p>Premium tailoring at your doorstep. Crafted for perfection.</p>
    </div>

    <div class="footer-links">
      <div>
        <h4>Explore</h4>
        <a href="#">Find Tailors</a>
        <a href="#">How it Works</a>
        <a href="#">Pricing</a>
      </div>

      <div>
        <h4>Company</h4>
        <a href="#">About</a>
        <a href="#">Careers</a>
        <a href="#">Contact</a>
      </div>

      <div>
        <h4>Legal</h4>
        <a href="#">Privacy Policy</a>
        <a href="#">Terms</a>
      </div>
    </div>

  </div>

  <div class="footer-bottom">
    <p>© 2026 TailorGo. All rights reserved.</p>
  </div>
</footer>
  )
}

export default Footer