# Workflow: theJumbler Full-Stack Build
Description: Real-time team shuffler with Docker-Redis backend and Glassmorphism frontend.

## Step 1: Backend Scaffolding
- Initialize a Node.js project with TypeScript and Socket.io.
- Connect to the local Redis instance on `localhost:6379`.
- Create a `RoomManager` class to handle participant logic and custom parameters.

## Step 2: Custom Parameter Shuffle Logic
- Implement a "Constrained Weighted Shuffle" function.
- Rule 1: Maximize diversity by separating participants from the same "College/Organization."
- Rule 2: Balance "Gender" ratios across all teams based on host settings.
- Rule 3: Ensure the shuffle is server-side and results are pushed via Redis Pub/Sub.

## Step 3: Supreme UI (Frontend)
- Build the React frontend based on the user's hand-drawn sketches.
- Use **Framer Motion** for a 3-second "Slot Machine" shuffle animation.
- Implement the "Team Reveal" state where the entire background changes to the team's neon color.

## Step 4: Autonomous Verification
- Use the built-in Browser Agent to simulate 3 participants joining a room.
- Record a video artifact of the host triggering the "Jumble" and all participants seeing the synchronized color reveal.