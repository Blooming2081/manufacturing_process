import React, { useRef, useEffect, useState } from 'react';

const Factory2DTwin = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const [isPlaying, setIsPlaying] = useState(false); // 기본값을 false로 변경

  // 제품 애니메이션 상태 - 단순하게 빈 배열로 시작
  const [products, setProducts] = useState([]);
  const productIdCounter = useRef(0);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const newWidth = Math.floor(rect.width);
        const newHeight = Math.floor(rect.height);
        
        setContainerSize(prevSize => {
          if (Math.abs(prevSize.width - newWidth) > 5 || Math.abs(prevSize.height - newHeight) > 5) {
            return { width: newWidth, height: newHeight };
          }
          return prevSize;
        });
      }
    };

    const timer = setTimeout(updateSize, 100);
    const resizeObserver = new ResizeObserver(entries => {
      clearTimeout(resizeObserver.timer);
      resizeObserver.timer = setTimeout(updateSize, 150);
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timer);
      clearTimeout(resizeObserver.timer);
      resizeObserver.disconnect();
    };
  }, []);

  // 제품 생성 및 경로 계산
  const createProduct = () => {
    const margin = 80;
    const lineSpacing = 180;
    
    const lines = [
      { y: margin + lineSpacing * 0, dir: 1 },
      { y: margin + lineSpacing * 1, dir: -1 },
      { y: margin + lineSpacing * 2, dir: 1 },
      { y: margin + lineSpacing * 3, dir: -1 }
    ];

    // 전체 경로 생성
    const path = [];
    lines.forEach((line, i) => {
      if (line.dir === 1) {
        // 좌→우
        for (let x = margin; x <= 800 - margin; x += 2) {
          path.push({ x, y: line.y });
        }
      } else {
        // 우→좌  
        for (let x = 800 - margin; x >= margin; x -= 2) {
          path.push({ x, y: line.y });
        }
      }
      
      // 다음 라인으로 연결
      if (i < lines.length - 1) {
        const nextLine = lines[i + 1];
        const currentX = line.dir === 1 ? (800 - margin) : margin;
        const steps = Math.abs(nextLine.y - line.y) / 2;
        
        for (let step = 1; step <= steps; step++) {
          const y = line.y + (nextLine.y - line.y) * (step / steps);
          path.push({ x: currentX, y });
        }
        
        // 다음 라인 시작점으로 이동
        const nextX = nextLine.dir === 1 ? margin : (800 - margin);
        const horizontalSteps = Math.abs(nextX - currentX) / 2;
        
        for (let step = 1; step <= horizontalSteps; step++) {
          const x = currentX + (nextX - currentX) * (step / horizontalSteps);
          path.push({ x, y: nextLine.y });
        }
      }
    });

    return {
      id: productIdCounter.current++,
      position: 0,
      path: path,
      status: 'normal',
      processHistory: [],
      glowIntensity: 0.5
    };
  };

  // 공정 박스 정의 (모두 중립 상태로 - 순수 유리)
  const processes = [
    [
      { name: 'Component\nExtraction', x: 160 }, 
      { name: 'Wire\nIntegration', x: 280 }, 
      { name: 'Header\nAssembly', x: 420 }, 
      { name: 'Dashboard\nIntegration', x: 580 }
    ],
    [
      { name: 'Fuel\nSystem', x: 600 }, 
      { name: 'Chassis\nMerge', x: 460 }, 
      { name: 'Exhaust\nIntegration', x: 320 }
    ],
    [
      { name: 'Front End\nModule', x: 180 }, 
      { name: 'Bumper\nAssembly', x: 300 }, 
      { name: 'Glass\nInstallation', x: 440 }, 
      { name: 'Seat\nIntegration', x: 560 }, 
      { name: 'Wheel\nAssembly', x: 680 }
    ],
    [
      { name: 'Headlight\nCalibration', x: 640 }, 
      { name: 'Wheel\nAlignment', x: 500 }, 
      { name: 'Waterproof\nInspection', x: 360 }
    ]
  ];

  // 제품이 공정 박스 안에 있는지 확인
  const checkProductInProcess = (product, processes) => {
    if (!product.path[product.position]) return null;
    
    const currentPos = product.path[product.position];
    const boxWidth = 140;
    const boxHeight = 160;
    
    for (let lineIndex = 0; lineIndex < processes.length; lineIndex++) {
      for (let processIndex = 0; processIndex < processes[lineIndex].length; processIndex++) {
        const process = processes[lineIndex][processIndex];
        const boxX = process.x - boxWidth/2;
        const boxY = currentPos.y - boxHeight/2;
        
        if (currentPos.x >= boxX && currentPos.x <= boxX + boxWidth &&
            currentPos.y >= boxY && currentPos.y <= boxY + boxHeight) {
          return { lineIndex, processIndex, process };
        }
      }
    }
    return null;
  };

  // 순수한 유리 공정박스 (제품 색상을 산란시키는 효과)
  const drawPureGlassBox = (ctx, x, y, width, height, text, productColor = null, scatterIntensity = 0) => {
    const cornerRadius = 32;
    
    // 기본 투명 유리 설정
    const baseGlass = {
      bg: [255, 255, 255, 0.08],      // 매우 연한 투명
      border: [255, 255, 255, 0.3],   // 연한 테두리
      shadow: [31, 38, 135, 0.1],     // 미세한 그림자
      highlight: [255, 255, 255, 0.2], // 연한 하이라이트
      text: [255, 255, 255, 0.9]      // 텍스트
    };
    
    // 1. 제품 색상 산란 효과 (제품이 있을 때만)
    if (productColor && scatterIntensity > 0) {
      const [r, g, b] = productColor;
      
      // 외부 산란 글로우 (유리 밖으로 퍼지는 빛)
      ctx.save();
      const scatterRadius = 60 * scatterIntensity;
      const scatterGradient = ctx.createRadialGradient(
        x + width/2, y + height/2, 0,
        x + width/2, y + height/2, scatterRadius
      );
      scatterGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.3 * scatterIntensity})`);
      scatterGradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${0.15 * scatterIntensity})`);
      scatterGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = scatterGradient;
      ctx.beginPath();
      ctx.roundRect(x - scatterRadius/2, y - scatterRadius/2, 
                   width + scatterRadius, height + scatterRadius, cornerRadius + 20);
      ctx.fill();
      ctx.restore();
      
      // 유리 내부 색상 산란 (굴절 효과)
      ctx.save();
      const innerScatterGradient = ctx.createRadialGradient(
        x + width/2, y + height/2, 0,
        x + width/2, y + height/2, Math.max(width, height) * 0.6
      );
      innerScatterGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.15 * scatterIntensity})`);
      innerScatterGradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${0.08 * scatterIntensity})`);
      innerScatterGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${0.02 * scatterIntensity})`);
      
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = innerScatterGradient;
      ctx.beginPath();
      ctx.roundRect(x + 5, y + 5, width - 10, height - 10, cornerRadius - 5);
      ctx.fill();
      ctx.restore();
      
      // 색상 하이라이트 (유리 가장자리 반사)
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.4 * scatterIntensity})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x + 1, y + 1, width - 2, height - 2, cornerRadius - 1);
      ctx.stroke();
    }
    
    // 2. 기본 유리 구조
    // 외부 그림자
    ctx.save();
    ctx.shadowColor = `rgba(${baseGlass.shadow[0]}, ${baseGlass.shadow[1]}, ${baseGlass.shadow[2]}, ${baseGlass.shadow[3]})`;
    ctx.shadowBlur = 25;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 8;
    
    // 매우 연한 유리 배경
    ctx.globalAlpha = baseGlass.bg[3];
    ctx.fillStyle = `rgb(${baseGlass.bg[0]}, ${baseGlass.bg[1]}, ${baseGlass.bg[2]})`;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, cornerRadius);
    ctx.fill();
    ctx.restore();
    
    // 3. 유리 테두리 (기본)
    ctx.strokeStyle = `rgba(${baseGlass.border[0]}, ${baseGlass.border[1]}, ${baseGlass.border[2]}, ${baseGlass.border[3]})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x + 0.5, y + 0.5, width - 1, height - 1, cornerRadius - 0.5);
    ctx.stroke();
    
    // 4. 유리 하이라이트 (상단 반사)
    const glassHighlight = ctx.createLinearGradient(x, y, x + width, y + height * 0.3);
    glassHighlight.addColorStop(0, `rgba(${baseGlass.highlight[0]}, ${baseGlass.highlight[1]}, ${baseGlass.highlight[2]}, ${baseGlass.highlight[3]})`);
    glassHighlight.addColorStop(1, `rgba(${baseGlass.highlight[0]}, ${baseGlass.highlight[1]}, ${baseGlass.highlight[2]}, ${baseGlass.highlight[3] * 0.1})`);
    
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = glassHighlight;
    ctx.beginPath();
    ctx.roundRect(x + 2, y + 2, width - 4, height * 0.25, cornerRadius - 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;
    
    // 5. 유리 반사 라인 (미세한 디테일)
    ctx.strokeStyle = `rgba(255, 255, 255, 0.6)`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x + cornerRadius, y + 0.25);
    ctx.lineTo(x + width - cornerRadius, y + 0.25);
    ctx.stroke();
    
    // 6. 좌측 반사 라인
    ctx.strokeStyle = `rgba(255, 255, 255, 0.4)`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x + 0.25, y + cornerRadius);
    ctx.lineTo(x + 0.25, y + height * 0.3);
    ctx.stroke();
    
    // 7. 텍스트 (항상 흰색, 유리 위에 에칭된 것처럼)
    ctx.fillStyle = `rgba(${baseGlass.text[0]}, ${baseGlass.text[1]}, ${baseGlass.text[2]}, ${baseGlass.text[3]})`;
    ctx.font = '600 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 텍스트에 미세한 그림자 (에칭 효과)
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 1;
    
    const lines = text.split('\n');
    const lineHeight = 18;
    const startY = y + height/2 - (lines.length - 1) * lineHeight / 2;
    
    lines.forEach((line, index) => {
      ctx.fillText(line, x + width/2, startY + index * lineHeight);
    });
    
    // 텍스트 그림자 리셋
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  };

  // 컨베이어 시스템 그리기
  const drawLiquidConveyorSystem = (ctx, lines, margin, beltWidth) => {
    const path = new Path2D();
    
    path.moveTo(margin, lines[0].y);
    lines.forEach((line, i) => {
      if (line.dir === 1) {
        path.lineTo(800 - margin, line.y);
      } else {
        path.lineTo(margin, line.y);
      }
      
      if (i < lines.length - 1) {
        const nextLine = lines[i + 1];
        const currentX = line.dir === 1 ? (800 - margin) : margin;
        path.lineTo(currentX, nextLine.y);
        if (nextLine.dir === 1) {
          path.lineTo(margin, nextLine.y);
        } else {
          path.lineTo(800 - margin, nextLine.y);
        }
      }
    });
    
    ctx.save();
    ctx.shadowColor = 'rgba(31, 38, 135, 0.15)';
    ctx.shadowBlur = 25;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 8;
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = beltWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke(path);
    ctx.restore();
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke(path);
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = beltWidth - 8;
    ctx.stroke(path);
    
    ctx.strokeStyle = 'rgba(120, 219, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.setLineDash([15, 10]);
    ctx.stroke(path);
    ctx.setLineDash([]);
  };

  // 제품 그리기 (더 큰 크기와 강한 발광으로 수정)
  const drawProduct = (ctx, x, y, status, glowIntensity) => {
    const productColors = {
      normal: [120, 219, 255],      // 시안
      processing: [52, 199, 89],    // 초록
      warning: [255, 193, 7],       // 주황
      error: [255, 69, 58]          // 빨강
    };
    
    const [r, g, b] = productColors[status];
    
    // 더 강한 발광 효과
    ctx.save();
    ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${0.9 * glowIntensity})`;
    ctx.shadowBlur = 30 * glowIntensity;
    
    // 더 큰 제품 몸체
    ctx.beginPath();
    ctx.roundRect(x - 12, y - 8, 24, 16, 6);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.95)`;
    ctx.fill();
    
    // 더 강한 하이라이트
    ctx.strokeStyle = `rgba(255, 255, 255, 0.9)`;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 내부 발광 (더 밝게)
    ctx.beginPath();
    ctx.roundRect(x - 8, y - 5, 16, 10, 4);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.8)`;
    ctx.fill();
    
    // 중앙 코어 (매우 밝게)
    ctx.beginPath();
    ctx.roundRect(x - 4, y - 2, 8, 4, 2);
    ctx.fillStyle = `rgba(255, 255, 255, 0.9)`;
    ctx.fill();
    
    ctx.restore();
    
    // 제품 상태 표시 (더 크게)
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.font = 'bold 12px -apple-system';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(status === 'error' ? '!' : 'P', x, y);
  };

  // 애니메이션 루프
  useEffect(() => {
    if (!isPlaying) return;

    const animate = () => {
      setProducts(prevProducts => {
        let newProducts = [...prevProducts];
        
        // 새 제품 생성 (확률적)
        if (Math.random() < 0.01 && newProducts.length < 5) {
          newProducts.push(createProduct());
        }
        
        // 제품 이동 및 상태 업데이트
        newProducts = newProducts.map(product => {
          if (product.position >= product.path.length - 1) {
            return null; // 제품 제거
          }
          
          const newProduct = {
            ...product,
            position: product.position + 1
          };
          
          // 공정 박스 확인
          const processInfo = checkProductInProcess(newProduct, processes);
          if (processInfo) {
            const { process } = processInfo;
            
            // 공정 상태에 따른 제품 상태 변경
            if (process.status === 'active') {
              newProduct.status = 'processing';
              newProduct.glowIntensity = 1.5;
            } else if (process.status === 'warning') {
              newProduct.status = 'warning';
              newProduct.glowIntensity = 1.2;
            } else if (process.status === 'error') {
              newProduct.status = 'error';
              newProduct.glowIntensity = 1.8;
            } else {
              newProduct.status = 'normal';
              newProduct.glowIntensity = 0.8;
            }
          } else {
            // 공정 밖에서는 기본 상태
            newProduct.status = 'normal';
            newProduct.glowIntensity = Math.max(0.5, newProduct.glowIntensity - 0.02);
          }
          
          return newProduct;
        }).filter(Boolean);
        
        return newProducts;
      });
      
      if (isPlaying) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  // 렌더링
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    canvas.width = containerSize.width * dpr;
    canvas.height = containerSize.height * dpr;
    canvas.style.width = containerSize.width + 'px';
    canvas.style.height = containerSize.height + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, containerSize.width, containerSize.height);

    const contentW = 800, contentH = 800;
    const scale = Math.min(containerSize.width / contentW, containerSize.height / contentH) * 0.85;
    const offsetX = (containerSize.width - contentW * scale) / 2;
    const offsetY = (containerSize.height - contentH * scale) / 2;

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    const margin = 80;
    const lineSpacing = 180;
    
    const lines = [
      { y: margin + lineSpacing * 0, label: 'Assembly Line Alpha', dir: 1 },
      { y: margin + lineSpacing * 1, label: 'Integration Line Beta', dir: -1 },
      { y: margin + lineSpacing * 2, label: 'Finishing Line Gamma', dir: 1 },
      { y: margin + lineSpacing * 3, label: 'Quality Line Delta', dir: -1 }
    ];

    // 컨베이어 시스템
    drawLiquidConveyorSystem(ctx, lines, margin, 90);
    
    // 연결 노드
    lines.forEach(line => {
      for (let x = margin; x <= 800 - margin; x += 120) {
        ctx.save();
        ctx.shadowColor = 'rgba(120, 219, 255, 0.5)';
        ctx.shadowBlur = 15;
        
        ctx.beginPath();
        ctx.arc(x, line.y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(120, 219, 255, 0.9)';
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }
    });

    // 공정 박스들 (순수 유리 + 제품 색상 산란 효과)
    processes.forEach((lineProcesses, lineIndex) => {
      const y = lines[lineIndex].y;
      lineProcesses.forEach((process, processIndex) => {
        const boxWidth = 140;
        const boxHeight = 160;
        const boxX = process.x - boxWidth/2;
        const boxY = y - boxHeight/2;
        
        // 이 박스 안에 있는 제품들의 색상과 강도 계산
        let productColor = null;
        let scatterIntensity = 0;
        
        products.forEach(product => {
          if (product.path[product.position]) {
            const pos = product.path[product.position];
            if (pos.x >= boxX && pos.x <= boxX + boxWidth &&
                pos.y >= boxY && pos.y <= boxY + boxHeight) {
              
              // 제품 상태에 따른 색상 설정
              const productColors = {
                normal: [120, 219, 255],      // 시안
                processing: [52, 199, 89],    // 초록
                warning: [255, 193, 7],       // 주황
                error: [255, 69, 58]          // 빨강
              };
              
              productColor = productColors[product.status];
              scatterIntensity = Math.max(scatterIntensity, product.glowIntensity);
            }
          }
        });
        
        // 순수 유리 박스 그리기 (제품 색상 산란 포함)
        drawPureGlassBox(ctx, boxX, boxY, boxWidth, boxHeight, process.name, productColor, scatterIntensity);
      });
    });

    // 제품들 그리기
    products.forEach(product => {
      if (product.path[product.position]) {
        const pos = product.path[product.position];
        drawProduct(ctx, pos.x, pos.y, product.status, product.glowIntensity);
      }
    });

    // 라벨
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '600 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 4;
    lines.forEach(line => {
      ctx.fillText(line.label, 20, line.y - 8);
    });
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // 방향 화살표
    const drawArrow = (x, y, angle) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = 'rgba(120, 219, 255, 0.8)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-10, -5);
      ctx.lineTo(-10, 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };

    lines.forEach((line, i) => {
      const arrowY = line.y - 25;
      
      if (line.dir === 1) {
        for (let x = margin + 60; x <= 800 - margin - 60; x += 120) {
          drawArrow(x, arrowY, 0);
        }
      } else {
        for (let x = 800 - margin - 60; x >= margin + 60; x -= 120) {
          drawArrow(x, arrowY, Math.PI);
        }
      }

      if (i < lines.length - 1) {
        const x = line.dir === 1 ? (800 - margin + 25) : (margin - 25);
        const nextY = lines[i + 1].y;
        drawArrow(x, line.y + (nextY - line.y) / 2, Math.PI / 2);
      }
    });

    ctx.restore();
  }, [containerSize, products]);

  return (
    <div 
      style={{
        minHeight: '100vh',
       
        backgroundSize: 'cover, 100% 100%, 100% 100%, 100% 100%',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* 컨트롤 패널 */}
      <div
        style={{
          marginBottom: '20px',
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          borderRadius: '16px',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}
      >
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            background: isPlaying ? 'rgba(255, 69, 58, 0.8)' : 'rgba(52, 199, 89, 0.8)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            padding: '8px 16px',
            fontWeight: '600',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)'
          }}
        >
          {isPlaying ? '⏸ 일시정지' : '▶️ 시작'}
        </button>
        <span style={{ color: 'white', fontWeight: '500' }}>
          활성 제품: {products.length}개
        </span>
      </div>

      {/* 메인 디스플레이 */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          borderRadius: '32px',
          padding: '20px',
          boxShadow: `
            0 8px 32px rgba(31, 38, 135, 0.2),
            inset 0 4px 20px rgba(255, 255, 255, 0.3)
          `,
          width: '100%',
          maxWidth: '1000px',
          height: '700px',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '32px',
            backdropFilter: 'blur(10px)',
            boxShadow: `
              inset -10px -8px 0px -11px rgba(255, 255, 255, 1),
              inset 0px -9px 0px -8px rgba(255, 255, 255, 1)
            `,
            opacity: 0.6,
            zIndex: -1,
            filter: 'blur(1px) brightness(115%)',
            pointerEvents: 'none'
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            imageRendering: 'optimizeQuality'
          }}
        />
      </div>

      {/* 상태 범례 */}
      <div
        style={{
          marginTop: '20px',
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            background: 'rgba(120, 219, 255, 0.9)',
            boxShadow: '0 0 10px rgba(120, 219, 255, 0.5)'
          }}></div>
          <span style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>정상</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            background: 'rgba(52, 199, 89, 0.9)',
            boxShadow: '0 0 10px rgba(52, 199, 89, 0.5)'
          }}></div>
          <span style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>가공중</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            background: 'rgba(255, 193, 7, 0.9)',
            boxShadow: '0 0 10px rgba(255, 193, 7, 0.5)'
          }}></div>
          <span style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>주의</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            background: 'rgba(255, 69, 58, 0.9)',
            boxShadow: '0 0 10px rgba(255, 69, 58, 0.5)'
          }}></div>
          <span style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>오류</span>
        </div>
      </div>
    </div>
  );
};

export default Factory2DTwin;