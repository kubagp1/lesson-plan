# Mobile Web-Based Lesson Plan

This project scrapes and processes data off the school website using node.js every hour. It has its UI built with React and MUI.

## Features

- Click on any teacher room or class to redirect to its plan
- Dynamic URL routing
- Single Page Application
- User can hide unnecessary columns (coming soon)
- Highlight current lesson
- Title of the website changes when you change the plan
- Available from a single IP address

## Technologies Used

- Built with TypeScript
- Uses Vite
- Uses Docker

## Screenshots

<p float="left">
  <img alt="Screenshot of the main inteface" src="/screenshots/screenshot1.png" width="33%" >
  <img alt="Screenshot of the main inteface with a select list expanded" src="/screenshots/screenshot2.png" width="33%" >
</p>

## Running the Project Locally

### For Production

To run this project locally for production you need to `docker-compose up`

### For Development

To run this project for development you need to:

1. Serve website for scraping on port 3000
2. In `backend/` run `npm start` and then `python ./serve_output.py`
3. In `frontend` run `npm dev`
