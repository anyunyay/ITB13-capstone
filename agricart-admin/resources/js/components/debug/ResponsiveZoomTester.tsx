import { useState, useEffect } from 'react';
import { useDisplayScale } from '@/hooks/use-display-scale';

/**
 * ResponsiveZoomTester - Visual testing component for zoom levels
 * Tests: 90%, 100%, 110%, 125%, 150% and display scaling
 */
export function ResponsiveZoomTester() {
  const scaleInfo = useDisplayScale();
  const [isVisible, setIsVisible] = useState(true);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Test elements at different sizes
  const testSizes = [
    { label: 'Small', size: 'text-sm p-2', width: 'w-32' },
    { label: 'Medium', size: 'text-base p-4', width: 'w-48' },
    { label: 'Large', size: 'text-lg p-6', width: 'w-64' },
  ];

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg hover:bg-primary/90 transition-colors z-[9999]"
      >
        Show Zoom Tester
      </button>
    );
  }

  const getZoomStatus = () => {
    const zoom = scaleInfo.browserZoom;
    if (zoom >= 145 && zoom <= 155) return { level: '150%', color: 'bg-purple-500' };
    if (zoom >= 120 && zoom <= 130) return { level: '125%', color: 'bg-blue-500' };
    if (zoom >= 105 && zoom <= 115) return { level: '110%', color: 'bg-green-500' };
    if (zoom >= 95 && zoom <= 105) return { level: '100%', color: 'bg-gray-500' };
    if (zoom >= 85 && zoom <= 95) return { level: '90%', color: 'bg-yellow-500' };
    return { level: `${zoom}%`, color: 'bg-orange-500' };
  };

  const zoomStatus = getZoomStatus();

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 9999,
      }}
      onMouseDown={handleMouseDown}
      className="select-none"
    >
      <div className="bg-card border-2 border-primary rounded-lg shadow-2xl overflow-hidden max-w-md">
        {/* Header */}
        <div className="drag-handle cursor-move bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">🔍 Zoom Tester</span>
            <span className={`${zoomStatus.color} text-white text-xs px-2 py-1 rounded-full font-semibold`}>
              {zoomStatus.level}
            </span>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="hover:bg-primary-foreground/20 rounded px-2 py-1 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Zoom Info */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Type:</span>
              <span className={`text-sm font-bold ${scaleInfo.isBrowserZoom ? 'text-blue-600' : 'text-green-600'}`}>
                {scaleInfo.isBrowserZoom ? '🔍 Browser Zoom' : '🖥️ Display Scaling'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Zoom Level:</span>
              <span className="text-sm font-mono">{scaleInfo.browserZoom}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Device Pixel Ratio:</span>
              <span className="text-sm font-mono">{scaleInfo.devicePixelRatio.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Scale Factor:</span>
              <span className="text-sm font-mono">{scaleInfo.scaleFactor.toFixed(3)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Viewport:</span>
              <span className="text-sm font-mono">{scaleInfo.effectiveWidth}×{scaleInfo.effectiveHeight}</span>
            </div>
          </div>

          {/* Zoom Level Indicators */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Target Zoom Levels:</h3>
            <div className="grid grid-cols-5 gap-1">
              {[90, 100, 110, 125, 150].map((level) => {
                const isActive = Math.abs(scaleInfo.browserZoom - level) < 5;
                return (
                  <div
                    key={level}
                    className={`text-center py-2 rounded text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground scale-110'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {level}%
                  </div>
                );
              })}
            </div>
          </div>

          {/* Visual Test Elements */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Visual Tests:</h3>
            {testSizes.map((test) => (
              <div key={test.label} className="space-y-1">
                <p className="text-xs text-muted-foreground">{test.label}</p>
                <div className={`${test.size} ${test.width} bg-primary/10 border border-primary rounded`}>
                  Test Box
                </div>
              </div>
            ))}
          </div>

          {/* Responsive Grid Test */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Grid Test:</h3>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-secondary/20 p-2 rounded text-center text-xs">
                  {i}
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-muted p-3 rounded text-xs space-y-1">
            <p className="font-semibold">Test Instructions:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Press <kbd className="px-1 py-0.5 bg-background rounded">Ctrl +</kbd> to zoom in</li>
              <li>Press <kbd className="px-1 py-0.5 bg-background rounded">Ctrl -</kbd> to zoom out</li>
              <li>Press <kbd className="px-1 py-0.5 bg-background rounded">Ctrl 0</kbd> to reset</li>
              <li>Check if layout remains stable</li>
              <li>Verify no horizontal scrolling</li>
            </ul>
          </div>

          {/* Status Indicators */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Status Checks:</h3>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className={scaleInfo.isScaled ? 'text-green-600' : 'text-gray-400'}>
                  {scaleInfo.isScaled ? '✓' : '○'}
                </span>
                <span>Scaling Detected</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={scaleInfo.isBrowserZoom ? 'text-blue-600' : 'text-gray-400'}>
                  {scaleInfo.isBrowserZoom ? '✓' : '○'}
                </span>
                <span>Browser Zoom Active</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={scaleInfo.devicePixelRatio > 1 ? 'text-purple-600' : 'text-gray-400'}>
                  {scaleInfo.devicePixelRatio > 1 ? '✓' : '○'}
                </span>
                <span>High DPI Display</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
