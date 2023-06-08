# Mobile Web-Based Lesson Plan

This project scrapes and processes data off the school website (Vulkan Optivum) using node.js every hour. It has its UI built with React and MUI.

This app was made with only my school ([ZST Radom](https://www.zst-radom.edu.pl/)) in mind. Some edge cases existing in other schools might not be handled. Default config for my school is included for easy deployment.

The frontend of the application is a Single Page Application built with React and MUI.

## Features

- Chips for groups and advanced classes
- Dark mode
- Show metadata about a plan
- Searchable categories
- Warns when plan is stale
- Able to derive teacher and classroom plans only from classes plans
- Click on any teacher room or class to redirect to its plan
- Dynamic URL routing
- Single Page Application
- User can hide unnecessary columns
- Highlight current lesson
- Title of the website changes when you change the plan
- Available from a single IP address
- 95 lighthouse performance score

## Technologies Used

- Built with TypeScript, React and MUI
- Uses Vite
- Uses Node.js v20
- Uses Docker

## Screenshots

<p float="left">
  <img alt="Screenshot of the main inteface" src="/screenshots/screenshot1.png" width="30%" >
  <img alt="Screenshot of the main inteface from a different category" src="/screenshots/screenshot2.png" width="30%" >
  <img alt="Screenshot of the hiding columns menu" src="/screenshots/screenshot3.png" width="30%" >
</p>

## Running the Project Locally

### For Production

To run this project locally for production you need to `docker-compose up --build`

### For Development

To run this project for development you need to:

1. Serve website for scraping on port 3000
2. In `backend/` run `npm start` and then `python ./serve_output.py`
3. In `frontend/` run `npm dev`

Alternatively, you can use [Restore Terminals](https://marketplace.visualstudio.com/items?itemName=EthanSK.restore-terminals) VSCode extension. (Config used for development is in this repo.)
