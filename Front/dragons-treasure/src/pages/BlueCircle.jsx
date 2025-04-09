
const BlueCircle = () => {
    return (
      <div className="relative">
        <div className="w-64 h-64 rounded-full bg-blue-700 opacity-80"></div>
        <div className="w-48 h-48 rounded-full bg-blue-500 opacity-70 absolute top-8 left-8"></div>
        <div className="w-32 h-32 rounded-full bg-blue-300 opacity-60 absolute top-16 left-16"></div>
        <div className="absolute -top-4 -right-4">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 0C20 11.0457 11.0457 20 0 20C11.0457 20 20 28.9543 20 40C20 28.9543 28.9543 20 40 20C28.9543 20 20 11.0457 20 0Z" fill="#FF4D4D"/>
          </svg>
        </div>
        <div className="absolute top-1/4 -right-8">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="12" fill="#FFD700"/>
          </svg>
        </div>
      </div>
    );
  };
  
  export default BlueCircle;
