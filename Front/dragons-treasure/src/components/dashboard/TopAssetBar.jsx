import React from 'react';

// Import decorative assets
import blueCircleImg from '../../assets/Images/blue_circle.png';
import blueWaveImg from '../../assets/Images/blue_line.png';
import yellowDotsImg from '../../assets/Images/yellow_dots.png';
import yellowWaveImg from '../../assets/Images/yellow_line.png';

const TopAssetBar = () => {
  return (
    <div className="w-full h-32 glass px-6 relative overflow-hidden">
      {/* Main container for all decorative elements */}
      <div className="absolute inset-0 z-0">
        {/* Left side decorative elements */}
        <div className="absolute top-2 left-4">
          <img 
            src={yellowWaveImg} 
            alt="" 
            className="h-14 object-contain opacity-80 transform -rotate-45 animate-pulse" 
          />
        </div>
        
        <div className="absolute top-16 left-20">
          <img 
            src={blueCircleImg} 
            alt="" 
            className="h-12 object-contain opacity-70" 
          />
        </div>
        
        <div className="absolute bottom-2 left-40">
          <img 
            src={yellowDotsImg} 
            alt="" 
            className="h-10 object-contain opacity-80 animate-bounce" 
            style={{ animationDuration: '3s' }}
          />
        </div>
        
        {/* Center decorative elements */}
        <div className="absolute top-4 left-1/3">
          <img 
            src={blueWaveImg} 
            alt="" 
            className="h-16 object-contain opacity-70 transform rotate-90" 
          />
        </div>
        
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
          <img 
            src={yellowDotsImg} 
            alt="" 
            className="h-14 object-contain opacity-60" 
          />
        </div>
        
        {/* Right side decorative elements */}
        <div className="absolute top-0 right-1/4">
          <img 
            src={blueCircleImg} 
            alt="" 
            className="h-20 object-contain opacity-80 animate-pulse" 
            style={{ animationDuration: '4s' }}
          />
        </div>
        
        <div className="absolute top-12 right-40">
          <img 
            src={yellowWaveImg} 
            alt="" 
            className="h-12 object-contain opacity-70 transform rotate-180" 
          />
        </div>
        
        <div className="absolute bottom-4 right-16">
          <img 
            src={blueWaveImg} 
            alt="" 
            className="h-14 object-contain opacity-80 transform -rotate-45" 
          />
        </div>
        
        <div className="absolute top-6 right-8">
          <img 
            src={yellowDotsImg} 
            alt="" 
            className="h-10 object-contain opacity-70" 
          />
        </div>
      </div>
      
      {/* Optional subtle shadow at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200/50 backdrop-blur-sm"></div>
    </div>
  );
};

export default TopAssetBar;