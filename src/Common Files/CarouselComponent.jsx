import React, { useState, useEffect } from 'react';
import car1 from '../Carousel Images/119119112_1512279995646097_1670945654959389599_n.jpg';
import car2 from '../Carousel Images/2136041-3840x2160-desktop-4k-hot-wheels-background.jpg';
import car3 from '../Carousel Images/Matchbox-70th-Anniversary.webp';
import car4 from '../Carousel Images/a89893adfa07dc06e9c7496423c396bd20241030190252559.jpg';
import car5 from '../Carousel Images/toy-car-toy-box-mini-163696.jpeg';

const images = [car1, car2, car3, car4, car5];

const CarouselComponent = () => {
  const [current, setCurrent] = useState(0);
  const length = images.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === length - 1 ? 0 : prev + 1));
    }, 3000);

    return () => clearInterval(timer);
  }, [length]);

  const goToSlide = (index) => {
    setCurrent(index);
  };

  return (
    <div style={styles.container}>
      <div style={styles.imageWrapper}>
        <img
          src={images[current]}
          alt={`car ${current}`}
          style={styles.image}
        />
      </div>

      {/* Dots */}
      <div style={styles.dotsContainer}>
        {images.map((_, idx) => (
          <div
            key={idx}
            onClick={() => goToSlide(idx)}
            style={{
              ...styles.dot,
              backgroundColor: current === idx ? '#fff' : '#888',
            }}
          />
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    // maxWidth: '900px',
    margin: 'auto',
    position: 'relative',
    // backgroundColor: 'black',
  },
  imageWrapper: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '400px',
    objectFit: 'cover',
    transition: 'transform 0.5s ease-in-out',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: '15px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '8px',
  },
  dot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
};

export default CarouselComponent;
