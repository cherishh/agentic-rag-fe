'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { GripVertical } from 'lucide-react';

interface ResizableLayoutProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  initialLeftWidth?: number;
}

export function ResizableLayout({ leftPanel, rightPanel, initialLeftWidth = 50 }: ResizableLayoutProps) {
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 处理拖拽开始
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // 处理拖拽过程
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // 限制最小和最大宽度
      const clampedWidth = Math.min(Math.max(newLeftWidth, 20), 80);
      setLeftWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  return (
    <div ref={containerRef} className='flex h-screen bg-gray-50'>
      {/* 左侧面板 */}
      <div style={{ width: `${leftWidth}%` }}>{leftPanel}</div>

      {/* 可拖拽的分隔条 */}
      <div
        className={`w-1 bg-gray-300 hover:bg-gray-400 cursor-col-resize flex items-center justify-center group transition-colors ${
          isDragging ? 'bg-blue-500' : ''
        }`}
        onMouseDown={handleMouseDown}
      >
        <div className='opacity-0 group-hover:opacity-100 transition-opacity'>
          <GripVertical className='h-4 w-4 text-gray-600' />
        </div>
      </div>

      {/* 右侧面板 */}
      <div style={{ width: `${100 - leftWidth}%` }}>{rightPanel}</div>
    </div>
  );
}
