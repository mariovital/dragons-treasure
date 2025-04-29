
const DotPattern = () => {
    return (
      <div className="grid grid-cols-12 gap-2">
        {Array(144).fill().map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary-yellow opacity-70"></div>
        ))}
      </div>
    );
  };
  
  export default DotPattern;
