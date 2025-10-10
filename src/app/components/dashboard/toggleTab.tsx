"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

export interface TabItem<T extends string = string> {
  text: string;
  value: T;
}

interface ToggleTabsProps<T extends string = string> {
  tabs: readonly TabItem<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  className?: string;
}

const ToggleTabs = <T extends string = string>({
  tabs,
  value,
  defaultValue,
  onChange,
  className = "",
}: ToggleTabsProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const btnRefs = useMemo(
    () => tabs.map(() => React.createRef<HTMLButtonElement>()),
    [tabs]
  );

  const [inner, setInner] = useState<T>(defaultValue ?? (tabs[0]?.value as T));
  const active = (value ?? inner) as T;

  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const updateIndicator = () => {
    const idx = tabs.findIndex((t) => t.value === active);
    const btn = btnRefs[idx]?.current;
    const wrap = containerRef.current;
    if (!btn || !wrap) return;
    const b = btn.getBoundingClientRect();
    const w = wrap.getBoundingClientRect();
    setIndicator({ left: b.left - w.left, width: b.width });
  };

  useEffect(() => {
    updateIndicator();
    const ro = new ResizeObserver(updateIndicator);
    if (containerRef.current) ro.observe(containerRef.current);
    btnRefs.forEach((r) => r.current && ro.observe(r.current!));
    return () => ro.disconnect();
  }, [active, tabs.length]);

  const handleClick = (val: T) => {
    if (value === undefined) setInner(val);
    onChange?.(val);
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        ref={containerRef}
        className="relative inline-flex gap-3 pb-3"
        role="tablist"
      >
        <div className="pointer-events-none absolute -bottom-0 left-0 right-0 h-[2px] bg-gray-200" />
        {tabs.map((t, i) => {
          const isActive = t.value === active;
          return (
            <button
              key={t.value}
              ref={btnRefs[i]}
              role="tab"
              aria-selected={isActive}
              onClick={() => handleClick(t.value)}
              className={[
                "px-4 py-2 rounded-[5px] text-sm transition-colors shadow-none",
                isActive
                  ? "bg-[rgba(15,103,177,0.05)] text-[#0F67B1] font-medium"
                  : "bg-[#F1F2F3] text-[#646161] hover:text-gray-700 font-medium",
              ].join(" ")}
            >
              {t.text}
            </button>
          );
        })}
        <div
          className="pointer-events-none absolute -bottom-[1px] h-[3px] bg-[#0F67B1] rounded-full transition-all duration-200"
          style={{ left: indicator.left, width: indicator.width }}
        />
      </div>
    </div>
  );
};

export default ToggleTabs;
