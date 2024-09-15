// src/App.js
import React, { useRef, useEffect, useState } from "react";
import styled from "styled-components";

// Styled canvas
const Canvas = styled.canvas`
  border: 1px solid #000;
  background-color: #87ceeb; /* Sky blue */
`;

// Vehicle dimensions
const Vehicle = {
  width: 40,
  height: 20,
};

function App() {
  const canvasRef = useRef(null);
  const [keys, setKeys] = useState({ left: false, right: false });

  // Vehicle state using useRef to store vehicle properties
  const vehicle = useRef({
    x: 100,
    y: 100,
    vx: 0,
    vy: 0,
    angle: 0,
  });

  // Terrain state
  const terrain = useRef(generateTerrain(800));

  // Physics constants
  const gravity = 0.5;
  const friction = 0.98;
  const acceleration = 0.5;
  const maxSpeed = 10;

  // Event listeners for key presses (left and right arrow keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        setKeys((prev) => ({ ...prev, left: true }));
      } else if (e.key === "ArrowRight") {
        setKeys((prev) => ({ ...prev, right: true }));
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === "ArrowLeft") {
        setKeys((prev) => ({ ...prev, left: false }));
      } else if (e.key === "ArrowRight") {
        setKeys((prev) => ({ ...prev, right: false }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Game loop to update the vehicle and render the scene
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let animationFrameId;

    const render = () => {
      updateVehicle(); // Update vehicle position
      draw(ctx); // Draw the scene
      animationFrameId = requestAnimationFrame(render); // Loop for animation
    };
    render();

    return () => {
      cancelAnimationFrame(animationFrameId); // Stop animation on unmount
    };
  }, [keys]);

  // Update vehicle based on key presses and physics
  const updateVehicle = () => {
    if (keys.left) {
      vehicle.current.vx -= acceleration;
    }
    if (keys.right) {
      vehicle.current.vx += acceleration;
    }

    // Apply friction to reduce velocity over time
    vehicle.current.vx *= friction;

    // Limit speed
    if (vehicle.current.vx > maxSpeed) vehicle.current.vx = maxSpeed;
    if (vehicle.current.vx < -maxSpeed) vehicle.current.vx = -maxSpeed;

    // Apply gravity to vertical velocity
    vehicle.current.vy += gravity;

    // Update vehicle's position
    vehicle.current.x += vehicle.current.vx;
    vehicle.current.y += vehicle.current.vy;

    // Handle collision with terrain
    const terrainY = getTerrainY(vehicle.current.x);
    if (vehicle.current.y + Vehicle.height / 2 > terrainY) {
      vehicle.current.y = terrainY - Vehicle.height / 2;
      vehicle.current.vy = 0;
    }

    // Prevent vehicle from moving off the edges
    if (vehicle.current.x < 0) {
      vehicle.current.x = 0;
      vehicle.current.vx = 0;
    }
    if (vehicle.current.x > canvasRef.current.width) {
      vehicle.current.x = canvasRef.current.width;
      vehicle.current.vx = 0;
    }
  };

  const draw = (ctx) => {
    // Clear the canvas for the next frame
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw terrain as a green area
    ctx.fillStyle = "#228B22";
    ctx.beginPath();
    ctx.moveTo(0, ctx.canvas.height);
    for (let x = 0; x < ctx.canvas.width; x++) {
      ctx.lineTo(x, terrain.current[x] || ctx.canvas.height);
    }
    ctx.lineTo(ctx.canvas.width, ctx.canvas.height);
    ctx.closePath();
    ctx.fill();

    // Draw the red vehicle
    ctx.fillStyle = "#FF0000";
    ctx.save();
    ctx.translate(vehicle.current.x, vehicle.current.y);
    ctx.fillRect(
      -Vehicle.width / 2,
      -Vehicle.height / 2,
      Vehicle.width,
      Vehicle.height
    );
    ctx.restore();
  };

  const getTerrainY = (x) => {
    if (x < 0 || x >= terrain.current.length) return canvasRef.current.height;
    return terrain.current[Math.floor(x)];
  };

  return (
    <div>
      <h1>Hill Climb Clone in React</h1>
      <Canvas ref={canvasRef} width={800} height={400} />
      <p>Use Left and Right arrow keys to move the vehicle.</p>
    </div>
  );
}

// Generate random terrain
function generateTerrain(width) {
  const height = 400;
  const terrain = [];
  let y = height / 2;

  for (let x = 0; x < width; x++) {
    const delta = Math.random() * 4 - 2;
    y += delta;
    if (y > height - 50) y = height - 50;
    if (y < 100) y = 100;
    terrain[x] = y;
  }

  return terrain;
}

export default App;
