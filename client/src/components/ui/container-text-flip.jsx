import React, { useState, useEffect, useId } from "react";
import { motion } from "framer-motion";

export function ContainerTextFlip({
    words = ["better", "modern", "beautiful", "awesome"],
    interval = 2000,
    className,
    textClassName,
    animationDuration = 700
}) {
    const id = useId();
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [width, setWidth] = useState(100);
    const textRef = React.useRef(null);

    const updateWidthForWord = () => {
        if (textRef.current) {
            const textWidth = textRef.current.scrollWidth + 60;
            setWidth(textWidth);
        }
    };

    useEffect(() => {
        updateWidthForWord();
    }, [currentWordIndex]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
        }, interval);

        return () => clearInterval(intervalId);
    }, [words, interval]);

    return (
        <motion.div
            layout
            layoutId={`words-here-${id}`}
            animate={{ width }}
            transition={{ duration: animationDuration / 2000 }}
            style={{
                position: "relative",
                display: "inline-block",
                borderRadius: "12px",
                paddingTop: "0.75rem",
                paddingBottom: "0.75rem",
                paddingLeft: "1rem",
                paddingRight: "1rem",
                textAlign: "center",
                fontSize: "2.25rem",
                fontWeight: "bold",
                color: "#fff",
                background: "linear-gradient(to bottom, #374151, #1f2937)",
                backdropFilter: "blur(12px)",
                boxShadow: "inset 0 -1px #10171e, inset 0 0 0 1px hsla(205,89%,46%,.24), 0 2px 4px #00000052",
            }}
            className={className}
            key={words[currentWordIndex]}>
            <motion.div
                transition={{
                    duration: animationDuration / 1000,
                    ease: "easeInOut",
                }}
                style={{ display: "inline-block" }}
                className={textClassName}
                ref={textRef}
                layoutId={`word-div-${words[currentWordIndex]}-${id}`}>
                <div style={{ display: "inline-block" }}>
                    {words[currentWordIndex].split("").map((letter, index) => (
                        <motion.span
                            key={index}
                            initial={{
                                opacity: 0,
                                filter: "blur(10px)",
                            }}
                            animate={{
                                opacity: 1,
                                filter: "blur(0px)",
                            }}
                            transition={{
                                delay: index * 0.02,
                            }}>
                            {letter}
                        </motion.span>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}
