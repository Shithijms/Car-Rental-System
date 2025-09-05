import React from "react";

const Title = ({ title, subtitle, align = "center" }) => {
    const alignClasses = align === "left" ? "md:items-start md:text-left" : "items-center text-center";
    return (
        <div className={`flex flex-col justify-center ${alignClasses}`}>
            <h1 className="font-semibold text-4xl md:text-[40px]">{title}</h1>
            <p className="text-sm md:text-base text-gray-500 mt-2 max-w-md">{subtitle}</p>
        </div>
    );
}

export default Title;