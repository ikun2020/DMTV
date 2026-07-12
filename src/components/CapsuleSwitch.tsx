/* eslint-disable react-hooks/exhaustive-deps */

import React, { useEffect, useRef, useState } from 'react';

interface CapsuleSwitchProps {
  options: { label: string; value: string }[];
  active: string;
  onChange: (value: string) => void;
  className?: string;
}

const CapsuleSwitch: React.FC<CapsuleSwitchProps> = ({
  options,
  active,
  onChange,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
  }>({ left: 0, width: 0 });

  const activeIndex = options.findIndex((opt) => opt.value === active);

  // 更新指示器位置
  const updateIndicatorPosition = () => {
    if (
      activeIndex >= 0 &&
      buttonRefs.current[activeIndex] &&
      containerRef.current
    ) {
      const button = buttonRefs.current[activeIndex];
      const container = containerRef.current;
      if (button && container) {
        const buttonRect = button.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        if (buttonRect.width > 0) {
          setIndicatorStyle({
            left: buttonRect.left - containerRect.left,
            width: buttonRect.width,
          });
        }
      }
    }
  };

  // 组件挂载时立即计算初始位置
  useEffect(() => {
    const timeoutId = setTimeout(updateIndicatorPosition, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  // 监听选中项变化
  useEffect(() => {
    const timeoutId = setTimeout(updateIndicatorPosition, 0);
    return () => clearTimeout(timeoutId);
  }, [activeIndex]);

  return (
    <div className="max-w-full overflow-x-auto rounded-full scrollbar-hide">
    <div
      ref={containerRef}
      className={`relative isolate inline-flex overflow-hidden rounded-full border border-gray-300/60 bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 p-1 shadow-sm dark:border-gray-600/60 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 ${
        className || ''
      }`}
    >
      {/* 滑动的渐变背景指示器 */}
      {indicatorStyle.width > 0 && (
        <div
          className='pointer-events-none absolute top-1 bottom-1 rounded-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 shadow-xl transition-all duration-300 ease-out dark:from-blue-600 dark:via-purple-600 dark:to-pink-600'
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
            boxShadow: '0 0 20px rgba(147, 51, 234, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)',
          }}
        />
      )}

      {options.map((opt, index) => {
        const isActive = active === opt.value;
        return (
          <button
            key={opt.value}
            ref={(el) => {
              buttonRefs.current[index] = el;
            }}
            onClick={() => onChange(opt.value)}
            className={`relative z-10 h-10 w-20 shrink-0 whitespace-nowrap rounded-full px-2 text-sm font-bold transition-all duration-200 cursor-pointer sm:h-11 sm:w-24 sm:px-3 sm:text-base ${
              isActive
                ? 'text-white dark:text-white drop-shadow-lg'
                : 'text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
    </div>
  );
};

export default CapsuleSwitch;
