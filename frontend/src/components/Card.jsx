import React from 'react';

const Card = ({ children, className = '', hover = true, ...props }) => {
    const hoverClass = hover ? 'card-hover' : '';

    return (
        <div
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 ${hoverClass} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
