const Loading = ({ progress }) => {
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full sm:w-[400px] md:w-[600px] lg:w-[850px] px-4">
      <div className="relative w-full h-10 bg-[#525961] rounded-lg mb-2">
        <div
          className="absolute top-0 left-0 h-full bg-[#00c0fb] rounded-lg"
          style={{
            width: `${progress}%`,
            transition: "width 0.6s ease-out", 
          }}
        >
        </div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold text-xl z-10">
          {progress}% 
        </div>
      </div>
    </div>
  );
};

export default Loading;
