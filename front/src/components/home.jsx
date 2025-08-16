import React from 'react';

const heroStyle = {
  minHeight: '90vh',
  background: 'linear-gradient(135deg, #f0f9ff 0%, #026aa7 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  textAlign: 'center',
  padding: '80px 20px 60px',
  position: 'relative',
  overflow: 'hidden'
};

const waveStyle = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: '100%',
  height: '100px',
  background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1200 120\' preserveAspectRatio=\'none\'%3E%3Cpath d=\'M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z\' opacity=\'.25\' fill=\'%23094c72\'%3E%3C/path%3E%3Cpath d=\'M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z\' opacity=\'.5\' fill=\'%23094c72\'%3E%3C/path%3E%3Cpath d=\'M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z\' fill=\'%23ffffff\'%3E%3C/path%3E%3C/svg%3E")',
  backgroundSize: 'cover'
};

const titleStyle = { 
  fontSize: '3.5em', 
  fontWeight: 800, 
  color: '#02315a', 
  margin: '0 0 20px 0',
  lineHeight: '1.2',
  textShadow: '1px 1px 3px rgba(0,0,0,0.1)',
  animation: 'fadeInUp 0.8s ease-out'
};

const subtitleStyle = { 
  fontSize: '1.5em', 
  color: '#094067', 
  marginBottom: '40px',
  maxWidth: '700px',
  lineHeight: '1.5',
  animation: 'fadeInUp 0.8s ease-out 0.2s forwards',
  opacity: 0
};

const btnStyle = {
  padding: '18px 54px', 
  fontSize: '1.2em', 
  borderRadius: '30px',
  backgroundColor: '#02315a', 
  color: '#fff', 
  border: 'none',
  boxShadow: '0 4px 15px rgba(2, 106, 167, 0.4)', 
  cursor: 'pointer', 
  fontWeight: 600,
  transition: 'all 0.3s ease',
  animation: 'fadeInUp 0.8s ease-out 0.4s forwards',
  opacity: 0,
  transform: 'translateY(20px)',
  ':hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 6px 20px rgba(2, 106, 167, 0.5)',
    backgroundColor: '#034a7a'
  }
};

const featuresSection = {
  display: 'flex', 
  flexWrap: 'wrap', 
  justifyContent: 'center',
  gap: "30px", 
  padding: '80px 20px',
  maxWidth: '1200px',
  margin: '0 auto',
  position: 'relative',
  zIndex: 2
};

const card = {
  flex: '1 1 260px', 
  maxWidth: '300px', 
  background: '#fff',
  padding: '40px 30px', 
  borderRadius: '20px',
  boxShadow: '0 5px 25px rgba(0, 0, 0, 0.08)', 
  textAlign: 'center',
  transition: 'all 0.3s ease',
  ':hover': {
    transform: 'translateY(-10px)',
    boxShadow: '0 15px 30px rgba(2, 106, 167, 0.15)'
  }
};

const emojiStyle = { 
  fontSize: "3em", 
  marginBottom: "20px",
  display: 'inline-block',
  transition: 'transform 0.3s ease',
  ':hover': {
    transform: 'scale(1.2) rotate(10deg)'
  }
};

const sectionTitleStyle = {
  textAlign: 'center',
  fontSize: '2.2em',
  fontWeight: 700,
  color: '#02315a',
  marginBottom: '60px',
  width: '100%'
};

const boatIllustrationStyle = {
  position: 'absolute',
  right: '10%',
  bottom: '20%',
  width: '300px',
  opacity: 0.8,
  animation: 'float 6s ease-in-out infinite'
};

const globalStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes float {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
    100% {
      transform: translateY(0px);
    }
  }
`;

const HomePage = () => (
  <main>
    <style>{globalStyles}</style>
    
    <div style={heroStyle}>
      <div style={waveStyle}></div>
      <img 
        src="https://cdn-icons-png.flaticon.com/512/3053/3053017.png" 
        alt="Boat illustration" 
        style={boatIllustrationStyle}
      />
      <h1 style={titleStyle}>Discover Amazing<br/>Boat Experiences</h1>
      <p style={subtitleStyle}>
        Book unique boat rides or share your own. Whether you're exploring coastal 
        waters or hosting sailing adventures, BoatDrive connects boat owners and 
        travelers seamlessly.
      </p>
      <a href="/boats">
        <button style={btnStyle}>Explore Boats</button>
      </a>
    </div>

    <section style={featuresSection}>
      <h2 style={sectionTitleStyle}>Why Choose BoatDrive?</h2>
      <div style={card}>
        <div style={emojiStyle}>🌊</div>
        <h3>Endless Destinations</h3>
        <p>Access hidden coves, private islands, and coastal towns only reachable by boat.</p>
      </div>
      <div style={card}>
        <div style={emojiStyle}>⏱️</div>
        <h3>Instant Booking</h3>
        <p>Find and book boats in minutes with our simple, transparent process.</p>
      </div>
      <div style={card}>
        <div style={emojiStyle}>🌟</div>
        <h3>Verified Owners</h3>
        <p>All boat owners are verified with ratings and reviews for your peace of mind.</p>
      </div>
      <div style={card}>
        <div style={emojiStyle}>💰</div>
        <h3>Earn Money</h3>
        <p>List your boat and turn your passion into profit when you're not using it.</p>
      </div>
    </section>
  </main>
);

export default HomePage;