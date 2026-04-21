function testCollisionScaling(scale) {
  const zoomFactor = Math.pow(scale, 0.7);
  const baseMinDistance = 25;
  const baseMaxOffset = 15;

  const minDistance = scale > 3 ? Math.max(2, baseMinDistance / zoomFactor) : Math.max(8, baseMinDistance / zoomFactor);
  const maxOffset = scale > 3 ? Math.max(1, baseMaxOffset / zoomFactor) : Math.max(4, baseMaxOffset / zoomFactor);

  console.log(`Scale: ${scale.toFixed(1)}x | zoomFactor: ${zoomFactor.toFixed(2)} | minDistance: ${minDistance.toFixed(1)} | maxOffset: ${maxOffset.toFixed(1)}`);
}

console.log('Zoom-responsive collision detection scaling:');
[0.4, 0.8, 1.0, 2.0, 3.0, 4.0, 6.0, 8.0, 12.0].forEach(testCollisionScaling);