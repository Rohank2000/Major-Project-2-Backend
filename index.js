const { getDbConnection } = require("./db/db.connect");

getDbConnection();

const express = require("express");

const app = express();

leadModel = require("./models/lead.models");
commentModel = require("./models/comment.models");
salesAgentModel = require("./models/salesAgent.models");
tagModel = require("./models/tag.models");

app.use(express.json());

// Imports the 'cors' package, which enables Cross-Origin Resource Sharing.

const cors = require("cors");

// This allows the frontend (running on a different origin/port) to make requests to this backend.

const corsOptions = {
  // Allows any website to call this API
  origin: "*",
  // Allows cookies to be sent with cross-origin requests
  credentials: true,
  // Returns 200 instead of 204 for preflight checks (browser compatibility)
  optionSuccessStatus: 200,
};

//Implementing cors functionality on express api using cors package and cors configuration.

app.use(cors(corsOptions));

// adding Leads Data through Mongoose

const createLead = async (leadData) => {
  try {
    const lead = new leadModel(leadData);
    const savedLead = await lead.save();
    return savedLead;
  } catch (error) {
    console.error("Error", error.message);
    throw error; // <-- re-throw so the route handler's catch receives it
  }
};

//adding Leads Data using Express Api

app.post("/leads", async (req, res) => {
  try {
    const { salesAgent } = req.body;
    if (salesAgent) {
      const agent = await salesAgentModel.findById(salesAgent);
      if (!agent) {
        return res
          .status(404)
          .json({ error: `Sales agent with ID '${salesAgent}' not found.` });
      }
    }

    const newLead = await createLead(req.body);
    res.status(201).json({ message: "New Lead Added" });

  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((er) => {
        if (er.kind === "required") {
          return `${er.path} is required.`;
        }
        return `'${er.path}' ${er.message.toLowerCase()}`;
      });
      res.status(400).json({ error: `Invalid input: ${messages.join(", ")}` });
    } else if (err.code === 11000) {
      res.status(409).json({ error: err.message });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

PORT = 3000 | 10000;

app.listen(PORT, ()=>{
  console.log("Server running on PORT - ", PORT);
});