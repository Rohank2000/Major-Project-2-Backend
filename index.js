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
    res.status(201).json({ message: "New Lead Added", newLead });
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

// adding Sales Agent Data through Mongoose

const createSalesAgent = async (salesAgentData) => {
  try {
    const newAgent = new salesAgentModel(salesAgentData);
    const savedAgent = await newAgent.save();
    return savedAgent;
  } catch (error) {
    console.error("Error", error.message);
    throw error;
  }
};

// adding Sales Agent Data using Express Api

app.post("/agents", async (req, res) => {
  try {
    const createdAgent = await createSalesAgent(req.body);
    res
      .status(201)
      .json({ message: "New Sales Agent Data Added.", createdAgent });
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map(
        (er) => `'${er.path}' ${er.message.toLowerCase()}`
      );
      res.status(400).json({ error: `Invalid input: ${messages.join(", ")}` });
    } else if (err.code === 11000) {
      res.status(409).json({
        error: `Sales agent with email '${req.body.email}' already exists.`,
      });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

//get sales agent data through mongoose

const getAllAgents = async () => {
  try {
    const agentList = await salesAgentModel.find();
    return agentList;
  } catch (error) {
    console.error("error", error.message);
    throw error;
  }
};

//get sales agent data using express api

app.get("/agents", async (req, res) => {
  try {
   const allAgents = await getAllAgents();
    if (!allAgents || allAgents.length === 0) {
      return res.status(404).json({ message: "Sales agent Data not found." });
    }
    res
      .status(200)
      .json({ message: "All Sales Agent Data Successfully Fetched." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on PORT - ", PORT);
});
