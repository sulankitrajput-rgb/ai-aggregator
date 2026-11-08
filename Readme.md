# SkyIndia — 3D Flight Simulator

A browser-based Three.js flight simulator prototype.

Features:
- Selectable Airbus fleet and Concorde
- Airline visual themes
- Indian airport selection
- VNS (Varanasi) selected by default
- 3D runway and airport terminal environment
- Passenger concourses and boarding bridges
- Airport taxiways and apron markings
- Air traffic control tower and hangars
- Aircraft landing gear animation
- Keyboard flight controls

## Run locally

Requirements: Node.js 20.19+ or 22.12+.

Install dependencies:

npm install

Start the development server:

npm run dev

Open the local URL printed by Vite.

## Build

npm run build

## Deploy to Render

1. Push the project to GitHub.
2. Sign in to Render.
3. Select New → Static Site.
4. Connect your GitHub repository.
5. Build command:

npm install && npm run build

6. Publish directory:

dist

7. Deploy.

## Controls

W / S — Pitch up / down
A / D — Bank left / right
Q / E — Yaw left / right
Shift / Ctrl — Throttle
G — Landing gear
F — Flaps
B — Brakes
R — Reset

## Important

This is a visual browser-game prototype.
The aircraft models and flight physics are simplified.
It is not suitable for real-world flight training.
