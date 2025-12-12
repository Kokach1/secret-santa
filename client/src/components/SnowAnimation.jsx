import { useEffect } from 'react';

export default function SnowAnimation() {
    useEffect(() => {
        const createSnowflake = () => {
            const snowflake = document.createElement('div');
            snowflake.classList.add('snowflake');
            snowflake.innerHTML = '❄';
            snowflake.style.left = Math.random() * 100 + 'vw';
            snowflake.style.animationDuration = Math.random() * 3 + 2 + 's';
            snowflake.style.opacity = Math.random();
            snowflake.style.fontSize = Math.random() * 10 + 10 + 'px';

            document.body.appendChild(snowflake);

            setTimeout(() => {
                snowflake.remove();
            }, 5000);
        };

        const interval = setInterval(createSnowflake, 300);

        // Add styles dynamically
        const style = document.createElement('style');
        style.innerHTML = `
      .snowflake {
        position: fixed;
        top: -10px;
        color: #FFF;
        user-select: none;
        pointer-events: none;
        z-index: 50;
        animation-name: fall;
        animation-timing-function: linear;
      }
      @keyframes fall {
        to {
          transform: translateY(100vh);
        }
      }
    `;
        document.head.appendChild(style);

        return () => {
            clearInterval(interval);
            document.head.removeChild(style);
        };
    }, []);

    return null;
}
