import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";

const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const titleVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
        opacity: 1, 
        scale: 1, 
        transition: { duration: 0.6, delay: 0.3 }
    },
};

const detailVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
        opacity: 1, 
        y: 0, 
        transition: { duration: 0.6, delay: 0.6 }
    },
};

const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
};

const NotFound = () => {
    const location = useLocation();

    useEffect(() => {
        console.error(
            "404 Error: User attempted to access non-existent route:",
            location.pathname
        );
    }, [location.pathname]);

    return (
        <motion.div
            className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div className="text-center" variants={titleVariants}>
                <h1 className="text-6xl md:text-8xl font-extrabold text-gray-800 mb-4">
                    404
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 mb-4">
                    Oops! The page you are looking for doesn’t exist.
                </p>
                <motion.p 
                    className="text-md text-gray-500 mb-8"
                    variants={detailVariants}
                >
                    You are currently at: <span className="font-semibold">{location.pathname}</span>
                </motion.p>
                <motion.a
                    href="/"
                    className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors duration-300"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                >
                    Return to Home
                </motion.a>
            </motion.div>
        </motion.div>
    );
};

export default NotFound;