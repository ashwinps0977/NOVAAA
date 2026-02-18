import { useEffect, useRef } from 'react';

const ParticleBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let particles: Particle[] = [];
        let animationFrameId: number;
        let mouseX = -1000;
        let mouseY = -1000;
        let isMouseMoving = false;
        let mouseStopTimeout: ReturnType<typeof setTimeout>;

        const MINT_GREEN = '#00cf7f';
        const SOFT_PURPLE = '#7c3aed';

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // Clear existing particles on resize or keep them? Clear for simplicity.
            particles = [];
        };

        class Particle {
            x: number;
            y: number;
            size: number;
            color: string;
            life: number;
            maxLife: number;
            vx: number;
            vy: number;
            type: 'circle' | 'plus';
            angle: number; // For orbit
            orbitRadius: number;
            orbitSpeed: number;

            constructor(x: number, y: number) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 2 + 1; // 1px to 3px
                this.color = Math.random() < 0.5 ? MINT_GREEN : SOFT_PURPLE;
                this.maxLife = Math.random() * 60 + 60; // 1-2 seconds (assuming 60fps)
                this.life = this.maxLife;
                this.type = Math.random() < 0.7 ? 'circle' : 'plus';

                // Initial velocity for spread/trail
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 0.5;
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed;

                // Orbit properties
                this.angle = Math.random() * Math.PI * 2;
                this.orbitRadius = Math.random() * 80 + 20; // 20px - 100px
                this.orbitSpeed = (Math.random() - 0.5) * 0.05;
            }

            update(currentMouseX: number, currentMouseY: number, isStationary: boolean) {
                this.life--;

                if (isStationary && this.life > 0) {
                    // Orbit logic when stationary
                    // We keep the particle alive if it's orbiting?
                    // Requirement: "spawn a trail... that linger... When stationary, particles should orbit"
                    // This implies persistent particles around cursor when stationary?
                    // Or just that the trailing particles transition to orbiting?
                    // Let's make particles transition to orbit if close enough and mouse is stationary.

                    // Simply, let's just make the particles move around the center (mouseX, mouseY)
                    this.angle += this.orbitSpeed;
                    const targetX = currentMouseX + Math.cos(this.angle) * this.orbitRadius;
                    const targetY = currentMouseY + Math.sin(this.angle) * this.orbitRadius;

                    // Smoothly move towards orbit position
                    this.x += (targetX - this.x) * 0.1;
                    this.y += (targetY - this.y) * 0.1;

                    // Keep alive while orbiting?
                    // "linger for 1-2 seconds before fading out" - this implies they die.
                    // But "When stationary, particles should orbit" implies they stay.
                    // Let's extend life if orbiting to maintain the cloud.
                    if (this.life < 20) this.life += 1;

                } else {
                    // Normal expansion/trail
                    this.x += this.vx;
                    this.y += this.vy;
                }
            }

            draw(currentMouseX: number, currentMouseY: number) {
                if (!ctx) return;

                // Distance-based Opacity
                const dx = this.x - currentMouseX;
                const dy = this.y - currentMouseY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const maxDist = 300; // Fade out range

                // Base opacity on life and distance
                let alpha = (this.life / this.maxLife);
                let distFactor = 1 - Math.min(dist / maxDist, 1);

                // Must be brightest at cursor
                // Combine factors
                const finalAlpha = alpha * distFactor;

                if (finalAlpha <= 0.01) return;

                ctx.globalAlpha = finalAlpha;
                ctx.fillStyle = this.color;
                ctx.strokeStyle = this.color;

                if (this.type === 'circle') {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    const s = this.size;
                    ctx.lineWidth = 1; // 1px thick
                    ctx.beginPath();
                    ctx.moveTo(this.x - s, this.y);
                    ctx.lineTo(this.x + s, this.y);
                    ctx.moveTo(this.x, this.y - s);
                    ctx.lineTo(this.x, this.y + s);
                    ctx.stroke();
                }
                ctx.globalAlpha = 1.0;
            }
        }

        const animate = () => {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Spawn particles if mouse is on screen
            if (mouseX !== -1000 && mouseY !== -1000) {
                // Spawn more when moving, fewer (or just maintain) when stationary?
                // "Follow' Effect: As the mouse moves, spawn a trail"
                if (isMouseMoving) {
                    for (let i = 0; i < 3; i++) { // Spawn rate
                        particles.push(new Particle(mouseX, mouseY));
                    }
                } else {
                    // Maintain a cloud when stationary
                    if (particles.length < 80) { // Keep ~80 particles orbiting
                        particles.push(new Particle(mouseX, mouseY));
                    }
                }
            }

            // Update and Draw
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.update(mouseX, mouseY, !isMouseMoving);
                p.draw(mouseX, mouseY);

                if (p.life <= 0) {
                    particles.splice(i, 1);
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (event: MouseEvent) => {
            // Need to map to canvas context if canvas is full screen
            // Since it's fixed/absolute 0,0, clientX/Y should match if we handle scroll?
            // "functions as a background layer (z-index: -1)" usually implies fixed or absolute covering the container.
            // If the container is the Hero section, it might be smaller than the window.
            // Let's assume for now we want particles at the cursor position relative to the viewport.
            // If the canvas is `fixed inset-0`, clientX/Y works.
            // If it is `absolute` in a `relative` container, we need offset.

            // Getting the rect ensures we use local coordinates relative to the canvas.
            const rect = canvas.getBoundingClientRect();
            mouseX = event.clientX - rect.left;
            mouseY = event.clientY - rect.top;

            isMouseMoving = true;
            clearTimeout(mouseStopTimeout);
            mouseStopTimeout = setTimeout(() => {
                isMouseMoving = false;
            }, 100);
        };

        const handleMouseLeave = () => {
            mouseX = -1000;
            mouseY = -1000;
            isMouseMoving = false;
        };

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseout', handleMouseLeave); // or mouseleave on document logic

        resizeCanvas();
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseout', handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
            clearTimeout(mouseStopTimeout);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{
                zIndex: 0,
                // Removed blur as per request "visible through the transparent sections"?
                // "visible through the transparent sections of the layout" - implies no blur? 
                // But previous requirement had blur. New req doesn't explicitly remove it but implies "sharp 3D image" contrast.
                // Re-reading: "Blending: Apply a subtle blur (filter: blur(2px))" was in OLD req.
                // New REQ: "Visual Style: ... sized strictly between 1px and 3px." 
                // It does NOT mention blur in the new request logic.
                // "Layering: ... behind the robot image but visible..."
                // I will remove the blur to keep particles sharp (1-3px) as requested for visual style.
            }}
        />
    );
};

export default ParticleBackground;
