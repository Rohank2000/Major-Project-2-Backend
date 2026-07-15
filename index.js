const { getDbConnection } = require("./db/db.connect");

getDbConnection();

const mongoose = require("mongoose");
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

//get leads data using mongoose

const getAllLeads = async (queryParameter) => {
  try {
    const { tags, ...standardFields } = queryParameter;

    const filter = Object.fromEntries(
      Object.entries(standardFields).filter(
        ([key, value]) => value !== undefined && value !== ""
      )
    );

    if (tags) {
      filter.tags = { $in: tags.split(", ") };
    }

    const filteredLeadsData = await leadModel
      .find(filter)
      .populate("salesAgent");
    return filteredLeadsData;
  } catch (error) {
    console.error("Error", error.message);
    throw error;
  }
};

//get leads data using express api

app.get("/leads", async (req, res) => {
  try {
    // Validation Logic for status, source, and salesAgent

    const { status, source, salesAgent } = req.query;

    const allowedStatuses = [
      "New",
      "Contacted",
      "Qualified",
      "Proposal Sent",
      "Closed",
    ];
    const allowedSources = [
      "Website",
      "Referral",
      "Cold Call",
      "Advertisement",
      "Email",
      "Other",
    ];

    // Validate 'status'

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid input : 'status' must be one of [${allowedStatuses.join(
          ", "
        )}].`,
      });
    }

    // Validate 'source'

    if (source && !allowedSources.includes(source)) {
      return res.status(400).json({
        error: `Invalid input : 'source' must be one of [${allowedSources.join(
          ", "
        )}]`,
      });
    }

    // Validate 'salesAgent'

    if (salesAgent && !mongoose.Types.ObjectId.isValid(salesAgent)) {
      return res.status(400).json({
        error: "Invalid input: 'salesAgent' must be a valid MongoDB ObjectId.",
      });
    }

    // If all validations pass, execute the database search

    const lead = await getAllLeads(req.query);

    if (!lead || lead.length === 0) {
      return res
        .status(404)
        .json({ message: "No leads found matching the criteria." });
    }

    res.status(200).json({ message: "Leads fetched successfully.", lead });
  } catch (error) {
    // Catch unrecognized keys
    if (error.name === "StrictModeError") {
      return res
        .status(400)
        .json({ error: `Invalid query Parameter : ${error.path}` });
    }

    res.status(500).json({ error: error.message });
  }
});

// Update Leads Data through Mongoose

const updateLead = async (leadId, updatedLead) => {
  try {
    return await leadModel.findByIdAndUpdate(leadId, updatedLead, {
      returnDocument: "after",
      runValidators: true,
    });
  } catch (error) {
    console.error("error", error.message);
    throw error;
  }
};

// update leads data using express api

app.put("/leads/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (id && !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Lead Id." });
    }

    const { salesAgent } = req.body;

    if (salesAgent && !mongoose.Types.ObjectId.isValid(salesAgent)) {
      return res
        .status(400)
        .json({ error: "'salesAgent' must be a valid MongoDB ObjectId." });
    }

    if (salesAgent) {
      const agent = await salesAgentModel.findById(salesAgent);
      if (!agent) {
        return res
          .status(404)
          .json({ error: `sales Agent with Id ${salesAgent} not found.` });
      }
    }

    const updatedLead = await updateLead(req.params.id, req.body);

    if (id && !updatedLead) {
      return res.status(404).json({ error: `Lead with ID '${id}' not found.` });
    }

    res.status(200).json({ message: "Lead Updated Succesfully.", updatedLead });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((er) => {
        if (er.kind === "required") {
          return `${er.path} is required.`;
        }
        return `${er.path} ${er.message.toLowerCase()}`;
      });
      res.status(400).json({ error: `Invalid input : ${messages.join(", ")}` });
    } else if (error.code === 11000) {
      res.status(409).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Delete Lead Data using mongoose

const deleteLead = async (leadId) => {
  try {
    return await leadModel.findByIdAndDelete(leadId);
  } catch (error) {
    console.error("error", error.message);
    throw error;
  }
};

// Delete Lead Data using express api

app.delete("/leads/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (id && !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Lead Id." });
    }
    const leadDeleted = await deleteLead(req.params.id);
    if (id && !leadDeleted) {
      return res.status(404).json({ error: `Lead with Id '${id}' not found.` });
    }
    res.status(200).json({ message: "Lead deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Comments using mongoose

const createComment = async (commentData) => {
  try {
    const comment = new commentModel(commentData);
    return await comment.save();
  } catch (error) {
    console.error("error", error.message);
    throw error;
  }
};

// Create Comments using express api

app.post("/leads/:id/comments", async (req, res) => {
  try {
    const { id } = req.params;

    if (id && !mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ error: `Lead with Id '${id}' is not valid Object Id.` });
    }
    const newComment = await createComment(req.body);
    if (id && !newComment) {
      return res.status(404).json({ error: `Lead with Id '${id}' not found.` });
    }
    res
      .status(201)
      .json({ message: "Comment created successfully.", newComment });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

//get comments data using mongoose

const getAllComments = async () => {
  try {
    return await commentModel.find();
  } catch (error) {
    console.error("error", error.message);
  }
};

//get comments data using express api

app.get("/leads/:id/comments", async (req, res) => {
  try {
    const { id } = req.params;

    if (id && !mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ error: `Lead With Id '${id}' not a valid Object Id.` });
    }
    const comments = await getAllComments();
    if (id && !comments) {
      return res.status(404).json({ error: `Lead with Id '${id}' not found.` });
    }
    res
      .status(200)
      .json({ message: "Comments fetched successfully.", comments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Tag using mongoose

const createTag = async (tagData)=>{
  try {
    const tag = new tagModel(tagData);
    return await tag.save();
  } catch (error) {
    console.error("error",error.message);
    throw error;
  }
}

// Create tag using express api

app.post("/tags", async (req,res)=>{
try {
  const newtag = await createTag(req.body);
  if (!newtag) {
    return res.status(400).json({error:"Error Occured While Creating New tag."});
  }
  res.status(201).json({message:"Tag Created Successfully.", newtag});
} catch (error) {
if (error.name==="ValidationError") {
  return res.status(400).json({error:error.message});
}  else if (error.code===11000){
  return res.status(409).json({error:error.message});
}
res.status(500).json({error:error.message});
}
});

// get tags using mongoose

const getTags = async ()=>{
  try {
    return await tagModel.find();
  } catch (error) {
    console.error("error",error.message);
  }
}

// get tags using express api

app.get("/tags", async (req,res)=>{
try {
  const tag = await getTags();
  if (!tag) {
    return res.status(404).json({error:"Tags not found."});
  } 
  res.status(200).json({message:"Tags Fetched Successfully.", tag});
} catch (error) {
  res.status(500).json({error:error.message});
}
});

//Get Leads Closed Last Week using mongoose

const getLeadsClosedLastWeek = async ()=>{
try {
  const oneWeekAgo = new Date(Date.now()-7*24*60*60*1000);
    return await leadModel.find({status: "Closed", closedAt:{$gte:oneWeekAgo}});
} catch (error) {
  console.error("error",error.message);
  throw error;
}
}

// Get Leads Closed Last Week using express api

app.get("/report/last-week", async (req,res)=>{
try {
  const leadsClosedLastWeek = await getLeadsClosedLastWeek();
  if (!leadsClosedLastWeek) {
    return res.status(404).json({error:"No Lead Closed Since Last Week"});
  }
  res.status(200).json({message:"Successfully Fetched Leads Closed in the Last 7 Days.", leadsClosedLastWeek});
} catch (error) {
res.status(500).json({error:error.message});  
}
});

// Get Total Leads in Pipeline using mongoose

const getTotalLeadsInPipeLine = async ()=>{
  try {
    return await leadModel.aggregate([
{$match:{$ne:{status:'Closed'}}},
{$group:{_id:"$status", count:{$sum:1}}},
{$sort:{_id:1}},
]);
  } catch (error) {
    console.error("error", error.message);
    throw error;
  }
}

// Get Total Leads in Pipeline express api 

app.get("/report/pipeline", async (req,res)=>{
try {
  const getTotalLead = await getTotalLeadsInPipeLine();
  const totalLeadsInPipeline = getTotalLead.reduce((acc,curr)=>
acc + curr.count,0);
  const byStatus = {};
  totalLeadsInPipeline.forEach((item)=>{
    byStatus[item._id]=item.count;
  });
  if (!getTotalLead) {
    return res.status(404).json({error:"No Leads Found."});
  }
  res.status(200).json({message:"Successfully Fetched total number of leads currently in the pipeline.", totalLeadsInPipeline, byStatus});
} catch (error) {
  res.status(500).json({error:error.message})
}
});

// Get Number of Leads closed by each salesAgent using mongoose

const getLeadsClosedByEachAgent = async ()=>{
  try {
    return await leadModel.aggregate([
      {$match:{status:"Closed"}},
      {$group:{_id:"$salesAgent",count:{$sum:1} }},
      {
        $lookup:{
          from:"salesagents",
          localField:"_id",
          foreignField:"_id",
          as:"agent",
        },
      },
      {$unwind:"$agent"},
      {
        $project:{
          _id:0,
          agentId:"$agent._id",
          agentName:"$agent.name",
          agentEmail:"$agent.email",
          closedLeads:"$count",
        },
      },
      {$sort:{closedLeads:-1}},
    ]);
  } catch (error) {
    console.error("error",error.message);
  }
}

// Get Number of Leads closed by each salesAgent express api

app.get("/report/closed-by-agent", async (req,res)=>{
try {
  const closedLeadsByAgent = await getLeadsClosedByEachAgent();
  if (!closedLeadsByAgent) {
    return res.status(404).json({error:"No 'Closed' Status found."});
  } 
  res.status(200).json({message:"Successfully fetched leads closed by each sales agent.", closedLeadsByAgent});
} catch (error) {
  res.status(500).json({error:error.message});
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
    res.status(200).json({
      message: "All Sales Agent Data Successfully Fetched.",
      allAgents,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on PORT - ", PORT);
});
