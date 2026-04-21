// Demo Controller - rAF animation engine for simulated navigation

import { DEMO_ROUTES, GATES, OUTDOOR_NODES, type DemoRoute } from './campus-data';

export interface Position {
  x: number;
  y: number;
  floor?: number;
  buildingId?: string;
}

export interface DemoState {
  truePos: Position;
  wifiPos: Position;
  kalmanPos: Position;
  trail: Position[];
  edgeIndex: number;
  edgeProgress: number;
  totalProgress: number;
  currentFloor: number;
  currentBuilding: string | null;
}

type DemoListener = (state: DemoState) => void;

// Simple 2D Kalman Filter
class KalmanFilter2D {
  private x: number = 0;
  private y: number = 0;
  private vx: number = 0;
  private vy: number = 0;
  private P: number[][] = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
  private Q: number = 0.1; // Process noise
  private R: number = 1; // Measurement noise

  predict(dx: number, dy: number) {
    this.x += this.vx + dx;
    this.y += this.vy + dy;
    // Simplified covariance update
    this.P[0][0] += this.Q;
    this.P[1][1] += this.Q;
  }

  update(measX: number, measY: number) {
    const K = this.P[0][0] / (this.P[0][0] + this.R);
    this.x += K * (measX - this.x);
    this.y += K * (measY - this.y);
    this.P[0][0] *= (1 - K);
    this.P[1][1] *= (1 - K);
  }

  getPosition(): Position {
    return { x: this.x, y: this.y };
  }

  reset(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
  }
}

class DemoController {
  private routeNodes: Position[] = [];
  private edgeIndex: number = 0;
  private edgeProgress: number = 0;
  private isPlaying: boolean = false;
  private speed: number = 1.5; // metres per second
  private noiseEnabled: boolean = true;
  private noiseLevel: number = 10; // max jitter in metres
  private trail: Position[] = [];
  private kalman: KalmanFilter2D = new KalmanFilter2D();
  private listeners: Set<DemoListener> = new Set();
  private rafId: number | null = null;
  private lastFrameTime: number = 0;
  private wifiPos: Position = { x: 0, y: 0 };
  private kalmanPos: Position = { x: 0, y: 0 };
  private truePos: Position = { x: 0, y: 0 };
  private prevRawX: number = 0;
  private prevRawY: number = 0;
  private stepSize: number = 0.5; // metres
  private currentRoute: DemoRoute | null = null;

  constructor() {
    this.tick = this.tick.bind(this);
  }

  // Set active route
  setRoute(routeId: string) {
    const route = DEMO_ROUTES.find(r => r.id === routeId);
    if (!route) return;

    this.currentRoute = route;
    this.routeNodes = this.resolveRouteNodes(route.nodeIds);
    this.reset();
  }

  // Resolve node IDs to positions
  private resolveRouteNodes(nodeIds: string[]): Position[] {
    const allNodes = [...GATES, ...OUTDOOR_NODES];
    return nodeIds.map(id => {
      const node = allNodes.find(n => n.id === id);
      if (node) {
        return { x: node.position.x, y: node.position.y, floor: 1, buildingId: node.buildingId };
      }
      // Fallback for building entry nodes
      return { x: 300, y: 300, floor: 1 };
    });
  }

  // Get edge length in metres
  private getEdgeLength(index: number): number {
    if (index < 0 || index >= this.routeNodes.length - 1) return 1;
    const from = this.routeNodes[index];
    const to = this.routeNodes[index + 1];
    return Math.hypot(to.x - from.x, to.y - from.y);
  }

  // Animation tick
  private tick(timestamp: number) {
    if (!this.isPlaying) return;

    const dt = this.lastFrameTime ? (timestamp - this.lastFrameTime) / 1000 : 0.016;
    this.lastFrameTime = timestamp;

    // Advance along current edge
    const edgeLength = this.getEdgeLength(this.edgeIndex);
    const advance = this.speed * dt;
    this.edgeProgress += advance / edgeLength;

    // Move to next edge(s) if we've passed the end
    while (this.edgeProgress >= 1.0 && this.edgeIndex < this.routeNodes.length - 2) {
      this.edgeProgress -= 1.0;
      this.edgeIndex++;
    }

    // Clamp at end of route
    if (this.edgeIndex >= this.routeNodes.length - 1) {
      this.edgeProgress = 0;
      this.isPlaying = false;
      this.notifyListeners();
      return;
    }

    // Interpolate position on current edge
    const fromNode = this.routeNodes[this.edgeIndex];
    const toNode = this.routeNodes[this.edgeIndex + 1];
    const t = Math.min(1, Math.max(0, this.edgeProgress));
    const rawX = fromNode.x + (toNode.x - fromNode.x) * t;
    const rawY = fromNode.y + (toNode.y - fromNode.y) * t;

    // Add Wi-Fi noise to get raw position
    const noiseX = this.noiseEnabled ? (Math.random() - 0.5) * this.noiseLevel * 0.08 : 0;
    const noiseY = this.noiseEnabled ? (Math.random() - 0.5) * this.noiseLevel * 0.08 : 0;
    this.wifiPos = { x: rawX + noiseX, y: rawY + noiseY };

    // Kalman filter: predict from motion, update from wifi
    const dx = rawX - this.prevRawX;
    const dy = rawY - this.prevRawY;
    this.kalman.predict(dx, dy);
    this.kalman.update(this.wifiPos.x, this.wifiPos.y);
    this.kalmanPos = this.kalman.getPosition();
    this.prevRawX = rawX;
    this.prevRawY = rawY;

    // True position
    this.truePos = { x: rawX, y: rawY, floor: fromNode.floor, buildingId: fromNode.buildingId };

    // Trail
    this.trail.push({ ...this.truePos });
    if (this.trail.length > 80) this.trail.shift();

    this.notifyListeners();
    this.rafId = requestAnimationFrame(this.tick);
  }

  // Notify all listeners
  private notifyListeners() {
    const state: DemoState = {
      truePos: this.truePos,
      wifiPos: this.wifiPos,
      kalmanPos: this.kalmanPos,
      trail: [...this.trail],
      edgeIndex: this.edgeIndex,
      edgeProgress: this.edgeProgress,
      totalProgress: this.routeNodes.length > 1 
        ? (this.edgeIndex + this.edgeProgress) / (this.routeNodes.length - 1)
        : 0,
      currentFloor: this.truePos.floor || 1,
      currentBuilding: this.truePos.buildingId || null,
    };
    this.listeners.forEach(fn => fn(state));
  }

  // Play/Pause
  play() {
    if (this.routeNodes.length < 2) return;
    this.isPlaying = true;
    this.lastFrameTime = 0;
    this.rafId = requestAnimationFrame(this.tick);
  }

  pause() {
    this.isPlaying = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  // Reset to start
  reset() {
    this.pause();
    this.edgeIndex = 0;
    this.edgeProgress = 0;
    this.trail = [];
    if (this.routeNodes.length > 0) {
      const start = this.routeNodes[0];
      this.truePos = { ...start };
      this.wifiPos = { ...start };
      this.kalmanPos = { ...start };
      this.kalman.reset(start.x, start.y);
      this.prevRawX = start.x;
      this.prevRawY = start.y;
    }
    this.notifyListeners();
  }

  // Step forward
  stepForward() {
    if (this.routeNodes.length < 2) return;
    
    const edgeLength = this.getEdgeLength(this.edgeIndex);
    this.edgeProgress += this.stepSize / edgeLength;
    
    while (this.edgeProgress >= 1.0 && this.edgeIndex < this.routeNodes.length - 2) {
      this.edgeProgress -= 1.0;
      this.edgeIndex++;
    }
    
    if (this.edgeIndex >= this.routeNodes.length - 1) {
      this.edgeProgress = 0;
    }
    
    this.updatePositionFromProgress();
    this.notifyListeners();
  }

  // Step backward
  stepBackward() {
    if (this.routeNodes.length < 2) return;
    
    const edgeLength = this.getEdgeLength(this.edgeIndex);
    this.edgeProgress -= this.stepSize / edgeLength;
    
    while (this.edgeProgress < 0 && this.edgeIndex > 0) {
      this.edgeIndex--;
      this.edgeProgress += 1.0;
    }
    
    if (this.edgeProgress < 0) {
      this.edgeProgress = 0;
    }
    
    // Trim trail
    if (this.trail.length > 0) {
      this.trail.pop();
    }
    
    this.updatePositionFromProgress();
    this.notifyListeners();
  }

  // Update position based on current progress
  private updatePositionFromProgress() {
    if (this.routeNodes.length < 2) return;
    
    const fromNode = this.routeNodes[this.edgeIndex];
    const toNode = this.routeNodes[Math.min(this.edgeIndex + 1, this.routeNodes.length - 1)];
    const t = Math.min(1, Math.max(0, this.edgeProgress));
    const rawX = fromNode.x + (toNode.x - fromNode.x) * t;
    const rawY = fromNode.y + (toNode.y - fromNode.y) * t;
    
    this.truePos = { x: rawX, y: rawY, floor: fromNode.floor, buildingId: fromNode.buildingId };
    this.wifiPos = { ...this.truePos };
    this.kalmanPos = { ...this.truePos };
  }

  // Setters
  setSpeed(speedMps: number) {
    this.speed = speedMps;
  }

  setStepSize(size: number) {
    this.stepSize = size;
  }

  setNoiseEnabled(enabled: boolean) {
    this.noiseEnabled = enabled;
  }

  setNoiseLevel(level: number) {
    this.noiseLevel = level;
  }

  // Speed from slider value (1-10)
  setSpeedFromSlider(sliderValue: number) {
    this.speed = 0.5 * Math.pow(1.5, sliderValue - 1);
  }

  // Subscribe to updates
  subscribe(listener: DemoListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Getters
  getState(): DemoState {
    return {
      truePos: this.truePos,
      wifiPos: this.wifiPos,
      kalmanPos: this.kalmanPos,
      trail: [...this.trail],
      edgeIndex: this.edgeIndex,
      edgeProgress: this.edgeProgress,
      totalProgress: this.routeNodes.length > 1 
        ? (this.edgeIndex + this.edgeProgress) / (this.routeNodes.length - 1)
        : 0,
      currentFloor: this.truePos.floor || 1,
      currentBuilding: this.truePos.buildingId || null,
    };
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getCurrentRoute(): DemoRoute | null {
    return this.currentRoute;
  }

  getSpeed(): number {
    return this.speed;
  }

  getNoiseEnabled(): boolean {
    return this.noiseEnabled;
  }

  getNoiseLevel(): number {
    return this.noiseLevel;
  }

  getStepSize(): number {
    return this.stepSize;
  }

  getRouteNodes(): Position[] {
    return this.routeNodes;
  }

  // Cleanup
  destroy() {
    this.pause();
    this.listeners.clear();
  }
}

// Singleton instance
export const demoController = new DemoController();

// Changes:
// - Created full rAF animation engine for demo navigation
// - Implemented Kalman filter for position smoothing
// - Added play/pause, step forward/backward controls
// - Speed and noise controls for demo customization
// - Trail management for position history
