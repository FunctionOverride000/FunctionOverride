'use client';

import React, { useEffect, useRef } from 'react';

const BackgroundAnimation = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    // Konfigurasi Partikel
    const particleCount = 80; // Jumlah titik (kurangi jika ingin lebih ringan lagi)
    const connectionDistance = 150; // Jarak maksimum untuk garis penghubung
    const moveSpeed = 0.5; // Kecepatan gerak

    // Fungsi untuk menyesuaikan ukuran canvas dengan layar
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Class Partikel
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * moveSpeed;
        this.vy = (Math.random() - 0.5) * moveSpeed;
        this.size = Math.random() * 2 + 1; // Ukuran titik random
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Pantulan jika kena pinggir layar
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(150, 150, 150, 0.5)'; // Warna titik (abu-abu transparan)
        ctx.fill();
      }
    }

    // Inisialisasi partikel
    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    // Loop Animasi Utama
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update dan gambar setiap partikel
      particles.forEach((particle, index) => {
        particle.update();
        particle.draw();

        // Gambar garis penghubung
        for (let j = index + 1; j < particles.length; j++) {
          const dx = particle.x - particles[j].x;
          const dy = particle.y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(150, 150, 150, ${1 - distance / connectionDistance})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    // Setup awal
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    initParticles();
    animate();

    // Cleanup saat komponen di-unmount (PENTING agar tidak memori bocor)
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
      style={{ background: 'transparent' }} // Pastikan background transparan agar warna CSS global terlihat
    />
  );
};

export default BackgroundAnimation;