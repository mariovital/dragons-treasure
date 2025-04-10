import { useCallback } from 'react';
  import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';

const ParticlesBackground = () => {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        background: {
          color: {
            value: 'transparent',
          },
        },
        fpsLimit: 60,
        particles: {
          color: {
            value: ['#4B5563', '#6B7280'],
            animation: {
              enable: true,
              speed: 15
            }
          },
          links: {
            enable: false
          },
          move: {
            direction: "top",
            enable: true,
            outModes: {
              default: "out"
            },
            random: true,
            speed: 1.2,
            straight: false,
            wobble: {
              enable: true,
              distance: 10,
              speed: 10
            }
          },
          number: {
            value: 150,
            density: {
              enable: false
            }
          },
          opacity: {
            value: { min: 0.2, max: 0.5 },
            animation: {
              enable: true,
              speed: 1,
              minimumValue: 0.1
            }
          },
          shape: {
            type: "circle"
          },
          size: {
            value: { min: 1.5, max: 4 },
            animation: {
              enable: true,
              speed: 3,
              minimumValue: 0.5
            }
          }
        },
        detectRetina: true
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
};

export default ParticlesBackground;