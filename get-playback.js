import sqlite3Lib from "sqlite3";
import { createObjectCsvWriter } from "csv-writer";

//test

const sqlite3 = sqlite3Lib.verbose();

// Open the database
let db = new sqlite3.Database("sqlite.db", sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the SQLite database.");
});

const sql = `SELECT p.createdAt, s.title, u.firstName, u.lastName
             FROM PlaybackEvent p
             JOIN Song s ON p.songId = s.id
             JOIN User u ON p.userId = u.id`;

// Specify path and header for CSV file
const csvWriter = createObjectCsvWriter({
  path: "out.csv",
  header: [
    { id: "createdAt", title: "PLAYBACK TIME" },
    { id: "title", title: "TITLE" },
    { id: "firstName", title: "FIRST NAME" },
    { id: "lastName", title: "LAST NAME" },
  ],
});

// Fetch data and write to CSV
db.all(sql, [], (err, rows) => {
  if (err) {
    throw err;
  }
  csvWriter
    .writeRecords(rows) // returns a promise
    .then(() => {
      console.log("CSV file written successfully");
    });
});

// Close the database connection
db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Closed the database connection.");
});
