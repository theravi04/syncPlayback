import React from "react";
import { useNavigate } from "react-router-dom";


const Card = ({ 
  icon, 
  iconColor = "text-emerald-400", 
  iconBgColor = "group-hover:bg-emerald-500/20",
  title, 
  description, 
  buttonText = "Get Started", 
  buttonColors = "from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700",
  hoverBorderColor = "hover:border-emerald-500/50",
  hoverShadowColor = "hover:shadow-emerald-500/10",
  to,
  className = "",
  disabled = false
}) => {
    const navigate = useNavigate();
  const handleClick = () => {
    navigate(to);
  };

  return (
    <div className={`group h-full ${className}`}>
      <div className={`bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-slate-700/50 ${hoverBorderColor} transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl ${hoverShadowColor} h-full flex flex-col ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <div className={`flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-slate-700/50 rounded-full mb-4 sm:mb-6 ${iconBgColor} transition-colors duration-300`}>
          {React.cloneElement(icon, { className: `w-7 h-7 sm:w-8 sm:h-8 ${iconColor}` })}
        </div>
        <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">{title}</h3>
        <p className="text-slate-400 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base flex-grow">{description}</p>
        <button
          onClick={handleClick}
          className={`block w-full bg-gradient-to-r ${buttonColors} text-white font-medium py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 text-center transform hover:scale-105 text-sm sm:text-base mt-auto ${disabled ? 'pointer-events-none opacity-50' : ''}`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default Card;