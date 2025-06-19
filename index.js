const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
const server = http.createServer(app);

// CORS configuration
app.use(cors({
    origin: ["http://localhost:5173", "https://intervue-assignment-frontend.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true,
}));


// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "https://intervue-assignment-frontend.vercel.app"],
        methods: ["GET", "POST"],
        credentials: true,
    },
});

// App state
let pollData = {};
const studentRegistry = new Map();

// Socket.IO Events
io.on("connection", (client) => {
    console.log(`Connected: ${client.id}`);

    // On reconnection, send existing poll if active
    if (pollData.question) {
        client.emit("poll-started", pollData);
    }

    // Register student name
    client.on("register-student", ({ name }) => {
        const uniqueName = makeUniqueName(name, client.id);
        studentRegistry.set(client.id, { name: uniqueName, socketId: client.id, hasVoted: false });

        console.log(`Student joined: ${uniqueName}`);
        io.emit("update-student-list", [...studentRegistry.values()]);
        client.emit("vote-status", [...studentRegistry.values()]);
    });

    // Teacher initiates a poll
    client.on("launch-poll", ({ question, options, timer, correctAnswer }) => {
        resetVotes();

        pollData = {
            question,
            options,
            optionCounts: options.reduce((obj, opt) => ({ ...obj, [opt]: 0 }), {}),
            correctAnswer,
            duration: timer,
            complete: false,
            results: {},
        };

        io.emit("poll-started", pollData);
        io.emit("vote-status", [...studentRegistry.values()]);

        // End poll after timeout
        setTimeout(() => {
            if (!pollData.complete) {
                broadcastFinalResults();
            }
        }, timer * 1000);
    });

    // Student votes
    client.on("submit-vote", ({ option }) => {
        const student = studentRegistry.get(client.id);
        if (!student || student.hasVoted || !pollData.options?.includes(option)) return;

        pollData.optionCounts[option]++;
        student.hasVoted = true;
        studentRegistry.set(client.id, student);

        io.emit("vote-status", [...studentRegistry.values()]);
        client.emit("vote-feedback", buildPartialResults());

        if (allStudentsVoted()) {
            broadcastFinalResults();
        }
    });

    // Disconnect handler
    client.on("disconnect", () => {
        console.log(`Disconnected: ${client.id}`);
        studentRegistry.delete(client.id);
        io.emit("update-student-list", [...studentRegistry.values()]);

        if (!pollData.complete && pollData.question && allStudentsVoted()) {
            broadcastFinalResults();
        }
    });
});

// Utilities
function buildPartialResults() {
    const totalVotes = Object.values(pollData.optionCounts).reduce((a, b) => a + b, 0);
    const percentageResults = {};

    for (const [opt, count] of Object.entries(pollData.optionCounts)) {
        percentageResults[opt] = totalVotes > 0 ? ((count / totalVotes) * 100).toFixed(2) : "0.00";
    }

    return {
        ...pollData,
        results: percentageResults,
        complete: false,
    };
}

function broadcastFinalResults() {
    const results = buildPartialResults();
    results.complete = true;
    pollData = results;
    io.emit("poll-results", results);
}

function resetVotes() {
    for (let [id, student] of studentRegistry.entries()) {
        student.hasVoted = false;
        studentRegistry.set(id, student);
    }
}

function allStudentsVoted() {
    return studentRegistry.size > 0 && [...studentRegistry.values()].every(s => s.hasVoted);
}

function makeUniqueName(name, id) {
    let base = name;
    let suffix = 1;
    let newName = base;

    while ([...studentRegistry.values()].some(s => s.name === newName && s.socketId !== id)) {
        newName = `${base} (${suffix++})`;
    }

    return newName;
}

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is up on port ${PORT}`);
});