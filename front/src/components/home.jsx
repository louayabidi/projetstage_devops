import React, { useEffect } from 'react';
import Slider from 'react-slick'; // For carousel
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { jwtDecode } from 'jwt-decode';

const heroStyle = {
  minHeight: '100vh',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  textAlign: 'center',
  padding: '80px 20px',
  overflow: 'hidden',
  color: '#fff',
};

const videoStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  zIndex: -1,
  filter: 'brightness(0.6)',
};

const overlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'rgba(2, 49, 90, 0.4)',
  zIndex: -1,
};

const waveStyle = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: '100%',
  height: '120px',
  background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1200 120\' preserveAspectRatio=\'none\'%3E%3Cpath d=\'M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z\' opacity=\'.25\' fill=\'%23ffffff\'%3E%3C/path%3E%3Cpath d=\'M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z\' opacity=\'.5\' fill=\'%23ffffff\'%3E%3C/path%3E%3Cpath d=\'M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z\' fill=\'%23ffffff\'%3E%3C/path%3E%3C/svg%3E")',
  backgroundSize: 'cover',
};

const titleStyle = {
  fontSize: '4.5rem',
  fontWeight: 900,
  color: '#fff',
  margin: '0 0 20px 0',
  lineHeight: '1.2',
  textShadow: '2px 2px 8px rgba(0,0,0,0.3)',
  animation: 'fadeInUp 1s ease-out',
  fontFamily: "'Poppins', sans-serif",
};

const subtitleStyle = {
  fontSize: '1.8rem',
  color: '#e0f7ff',
  marginBottom: '40px',
  maxWidth: '800px',
  lineHeight: '1.6',
  animation: 'fadeInUp 1s ease-out 0.3s forwards',
  opacity: 0,
};

const btnStyle = {
  padding: '20px 60px',
  fontSize: '1.3rem',
  borderRadius: '50px',
  backgroundColor: '#ff6f61',
  color: '#fff',
  border: 'none',
  boxShadow: '0 6px 20px rgba(255, 111, 97, 0.4)',
  cursor: 'pointer',
  fontWeight: 700,
  transition: 'all 0.3s ease',
  animation: 'pulse 2s ease-in-out infinite',
  position: 'relative',
  zIndex: 2,
};

const featuresSection = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: '30px',
  padding: '100px 20px',
  maxWidth: '1400px',
  margin: '0 auto',
  background: '#f0f9ff',
};

const card = {
  flex: '1 1 280px',
  maxWidth: '320px',
  background: '#fff',
  padding: '40px 30px',
  borderRadius: '20px',
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
  textAlign: 'center',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  ':hover': {
    transform: 'translateY(-12px)',
    boxShadow: '0 15px 40px rgba(2, 106, 167, 0.2)',
  },
};

const iconStyle = {
  width: '60px',
  height: '60px',
  marginBottom: '20px',
  transition: 'transform 0.3s ease',
  ':hover': {
    transform: 'scale(1.2)',
  },
};

const sectionTitleStyle = {
  textAlign: 'center',
  fontSize: '2.8rem',
  fontWeight: 800,
  color: '#02315a',
  marginBottom: '80px',
  width: '100%',
  fontFamily: "'Poppins', sans-serif",
};

const carouselSection = {
  padding: '80px 20px',
  background: '#fff',
  textAlign: 'center',
};

const carouselImageStyle = {
  width: '100%',
  height: '400px',
  objectFit: 'cover',
  borderRadius: '15px',
};

const globalStyles = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
    100% { transform: translateY(0px); }
  }
  .slick-prev, .slick-next {
    z-index: 2;
    width: 50px;
    height: 50px;
    background: rgba(2, 49, 90, 0.7);
    border-radius: 50%;
  }
  .slick-prev:before, .slick-next:before {
    color: #fff;
  }
  @media (max-width: 768px) {
    ${titleStyle.fontSize} = '3rem';
    ${subtitleStyle.fontSize} = '1.2rem';
    ${btnStyle.padding} = '15px 40px';
    ${btnStyle.fontSize} = '1rem';
  }
  @media (max-width: 480px) {
    ${titleStyle.fontSize} = '2.2rem';
    ${subtitleStyle.fontSize} = '1rem';
    ${card.flex} = '1 1 100%';
  }
`;

const HomePage = () => {




  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('token');
    const provider = searchParams.get('provider');

    if (token && provider) {
      try {
        localStorage.setItem('token', token);
        const user = jwtDecode(token);
        localStorage.setItem('userId', user._id);

        // ✅ Clean URL (remove ?token=...&provider=...)
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (err) {
        console.error('Failed to decode JWT:', err);
      }
    }
  }, []);
  
  // Sample destinations for carousel
  const destinations = [
    {
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
      title: 'Maldives Paradise',
    },
    {
      image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206',
      title: 'Mediterranean Coast',
    },
    {
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
      title: 'Caribbean Getaway',
    },
  ];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <main>
      <style>{globalStyles}</style>

      <div style={heroStyle}>
        <video style={videoStyle} autoPlay loop muted playsInline>
          <source src="https://assets.mixkit.co/videos/preview/mixkit-waves-crashing-on-the-beach-1191-large.mp4" type="video/mp4" />
        </video>
        <div style={overlayStyle}></div>
        <div style={waveStyle}></div>
        <h1 style={titleStyle}>Embark on Your<br />Sea Adventure</h1>
        <p style={subtitleStyle}>
          Discover breathtaking boat rides or list your own vessel. Explore hidden coves, sail vibrant coasts, or host unforgettable journeys with BoatDrive.
        </p>
        <div style={{ display: 'flex', gap: '20px' }}>
          <a href="/boats">
            <button style={btnStyle}>Explore Boats</button>
          </a>
          <a href="/list-your-boat">
            <button style={{ ...btnStyle, backgroundColor: '#34c759' }}>
              List Your Boat
            </button>
          </a>
        </div>
      </div>

      <section style={carouselSection}>
        <h2 style={sectionTitleStyle}>Explore Top Destinations</h2>
        <Slider {...sliderSettings}>
          {destinations.map((dest, index) => (
            <div key={index}>
              <img src={dest.image} alt={dest.title} style={carouselImageStyle} />
              <h3 style={{ marginTop: '20px', color: '#02315a' }}>{dest.title}</h3>
            </div>
          ))}
        </Slider>
      </section>

      <section style={featuresSection}>
        <h2 style={sectionTitleStyle}>Why Choose BoatDrive?</h2>
        <div style={card}>
          <img src="https://cdn-icons-png.flaticon.com/512/3053/3053017.png" alt="Destinations" style={iconStyle} />
          <h3>Endless Destinations</h3>
          <p>Access hidden coves, private islands, and coastal towns only reachable by boat.</p>
        </div>
        <div style={card}>
          <img src="https://cdn-icons-png.flaticon.com/512/2784/2784459.png" alt="Booking" style={iconStyle} />
          <h3>Instant Booking</h3>
          <p>Find and book boats in minutes with our simple, transparent process.</p>
        </div>
        <div style={card}>
          <img src="https://cdn-icons-png.flaticon.com/512/992/992000.png" alt="Verified" style={iconStyle} />
          <h3>Verified Owners</h3>
          <p>All boat owners are verified with ratings and reviews for your peace of mind.</p>
        </div>
        <div style={card}>
          <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Earn" style={iconStyle} />
          <h3>Earn Money</h3>
          <p>List your boat and turn your passion into profit when you're not using it.</p>
        </div>
      </section>

      <section style={{ ...carouselSection, background: '#e0f7ff' }}>
        <h2 style={sectionTitleStyle}>What Our Users Say</h2>
        <Slider {...sliderSettings}>
          <div>
            <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
              "BoatDrive made our family trip unforgettable! The booking was seamless, and the boat was perfect."
            </p>
            <p style={{ fontWeight: 600, marginTop: '10px' }}>- Sarah M.</p>
          </div>
          <div>
            <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
              "Listing my boat was so easy, and I started earning within days. Highly recommend!"
            </p>
            <p style={{ fontWeight: 600, marginTop: '10px' }}>- John D.</p>
          </div>
        </Slider>
      </section>
    </main>
  );
};

export default HomePage;