const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// --------------------------------------------------
// PARCEL DATA
// --------------------------------------------------

let parcels = [
    {
        id: "P101",
        destination: "Hyderabad",
        distance: 15,
        urgency: 5,
        deadline: 3
    },
    {
        id: "P102",
        destination: "Warangal",
        distance: 120,
        urgency: 3,
        deadline: 8
    },
    {
        id: "P103",
        destination: "Vijayawada",
        distance: 275,
        urgency: 4,
        deadline: 5
    },
    {
        id: "P104",
        destination: "Nalgonda",
        distance: 100,
        urgency: 2,
        deadline: 12
    },
    {
        id: "P105",
        destination: "Secunderabad",
        distance: 10,
        urgency: 5,
        deadline: 2
    }
];


// --------------------------------------------------
// DEADLINE PRIORITY
// --------------------------------------------------

function getDeadlinePriority(deadline) {

    if (deadline <= 2) {
        return 5;
    }

    if (deadline <= 4) {
        return 4;
    }

    if (deadline <= 6) {
        return 3;
    }

    if (deadline <= 10) {
        return 2;
    }

    return 1;
}


// --------------------------------------------------
// PRIORITY SCORE
// --------------------------------------------------

function calculateScore(parcel) {

    const deadlinePriority =
        getDeadlinePriority(parcel.deadline);

    const score =
        (parcel.urgency * 5) +
        (deadlinePriority * 3) -
        (parcel.distance * 0.5);

    return Number(score.toFixed(2));
}


// --------------------------------------------------
// PRIORITY LABEL
// --------------------------------------------------

function getPriorityLabel(score) {

    if (score >= 20) {
        return "HIGH";
    }

    if (score >= 5) {
        return "MEDIUM";
    }

    return "LOW";
}


// --------------------------------------------------
// GET ALL PARCELS
// --------------------------------------------------

app.get("/api/parcels", (req, res) => {

    res.json(parcels);

});


// --------------------------------------------------
// ADD PARCEL
// --------------------------------------------------

app.post("/api/parcels", (req, res) => {

    const {
        id,
        destination,
        distance,
        urgency,
        deadline
    } = req.body;


    // Validation

    if (
        !id ||
        !destination ||
        distance <= 0 ||
        urgency < 1 ||
        urgency > 5 ||
        deadline <= 0
    ) {

        return res.status(400).json({
            message: "Invalid parcel details"
        });

    }


    // Check duplicate ID

    const exists =
        parcels.some(parcel => parcel.id === id);

    if (exists) {

        return res.status(400).json({
            message: "Parcel ID already exists"
        });

    }


    const newParcel = {

        id: id,

        destination: destination,

        distance: Number(distance),

        urgency: Number(urgency),

        deadline: Number(deadline)

    };


    parcels.push(newParcel);


    res.status(201).json({

        message: "Parcel added successfully",

        parcel: newParcel

    });

});


// --------------------------------------------------
// DELETE PARCEL
// --------------------------------------------------

app.delete("/api/parcels/:id", (req, res) => {

    const id = req.params.id;


    const oldLength = parcels.length;


    parcels =
        parcels.filter(parcel => parcel.id !== id);


    if (parcels.length === oldLength) {

        return res.status(404).json({
            message: "Parcel not found"
        });

    }


    res.json({
        message: "Parcel deleted successfully"
    });

});


// --------------------------------------------------
// GENERATE DELIVERY SCHEDULE
// --------------------------------------------------

app.get("/api/schedule", (req, res) => {

    /*
        DAA GREEDY ALGORITHM

        1. Calculate priority score
        2. Sort parcels by highest score
        3. Earlier deadline breaks a tie
        4. Shorter distance breaks another tie
    */


    const schedule = parcels.map(parcel => {

        const score =
            calculateScore(parcel);


        return {

            ...parcel,

            score: score,

            priority: getPriorityLabel(score)

        };

    });


    // Greedy sorting

    schedule.sort((a, b) => {

        // Highest priority score first

        if (b.score !== a.score) {

            return b.score - a.score;

        }


        // Earlier deadline first

        if (a.deadline !== b.deadline) {

            return a.deadline - b.deadline;

        }


        // Shorter distance first

        return a.distance - b.distance;

    });


    res.json(schedule);

});


// --------------------------------------------------
// RESET PARCELS
// --------------------------------------------------

app.delete("/api/reset", (req, res) => {

    parcels = [];

    res.json({
        message: "All parcels removed"
    });

});


// --------------------------------------------------
// START SERVER
// --------------------------------------------------

app.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});