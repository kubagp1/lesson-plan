# Mobile Web-Based Lesson Plan

This project scrapes and processes data from the school website (Vulkan Optivum) using Node.js every hour. Its UI is built with React and MUI.

This app was designed specifically for my school ([ZST Radom](https://www.zst-radom.edu.pl/)). Some edge cases that exist in other schools might not be handled. The default configuration for my school is included for easy deployment.

The frontend of the application is a Single Page Application built with React and MUI.

## Features

- Chips for groups and advanced classes
- Dark mode
- Displays metadata about a plan
- Searchable categories
- Warns when the plan is stale
- Capable of deriving teacher and classroom plans only from class plans
- Click on any teacher, room, or class to redirect to its plan
- Dynamic URL routing
- Single Page Application
- Users can hide unnecessary columns
- Highlights the current lesson
- The title of the website changes when you change the plan
- Accessible from a single IP address
- 95 Lighthouse performance score

## Technologies Used

- Built with TypeScript, React, and MUI
- Uses Vite
- Uses Node.js v20
- Uses Docker

## Screenshots

<p float="left">
  <img alt="Screenshot of the main interface" src="/screenshots/screenshot1.png" width="30%" >
  <img alt="Screenshot of the main interface from a different category" src="/screenshots/screenshot2.png" width="30%" >
  <img alt="Screenshot of the hiding columns menu" src="/screenshots/screenshot3.png" width="30%" >
</p>

## Running the Project Locally

### For Production

To run this project locally for production, you need to execute `docker-compose up --build`.

### For Development

To run this project for development, you need to:

1. Serve the website for scraping on port 3000.
2. In `backend/`, run `npm start` and then `python ./serve_output.py`.
3. In `frontend/`, run `npm dev`.

Alternatively, you can use the [Restore Terminals](https://marketplace.visualstudio.com/items?itemName=EthanSK.restore-terminals) VSCode extension. (The configuration used for development is in this repository.)
