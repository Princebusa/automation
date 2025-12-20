import mongoose, {Schema} from "mongoose";


const userSchema = new Schema({
    name: {
        type: String, 
        required: true
    },
    email: {
        type: String, 
        required: true, 
        unique: true
    },
    password: {
        type: String, 
        required: true
    },
}, {timestamps: true});


const EdgesSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    source: {
        type: String,
        required: true
    },
    target: {
        type: String,
        required: true
    }
}, {
    _id: false
})


const PositionSchema = new Schema({
    x: {
        type: Number,
        required: true
    },
    y: {
        type: Number,
        required: true
    }
}, {
    _id: false
})

const NodeDataSchema = new Schema({
    kind:{
        type: String,
        enum: ["ACTION", "TRIGGER"],
        required: true
    },
    metadata: Schema.Types.Mixed
    
},
{ _id: false }
)


const WorkflowNodeSchema = new Schema({
    
    id:{
        type: String,
        required: true
    },
    position: PositionSchema,
    credentials: Schema.Types.Mixed,
    nodeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "nodes"
    },
    data: NodeDataSchema
}, {
     _id: false

})

const WorkFlowSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId, 
        ref: 'Users',
        required: true
    },
    nodes: [WorkflowNodeSchema],
    edges: [EdgesSchema],
});


const CredentialsSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    required: {
        type: Boolean,
        required: true
    }
})

const NodesSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["ACTION", "TRIGGER"],
        required: true
    },
    credentialsType: [CredentialsSchema],

})



const ExecutionSchema = new Schema({
    workflowId: {
        type: Schema.Types.ObjectId,
        ref: 'WorkFlows',
        required: true
    },
    status: {
        type: String,
        enum: ["SUCCESS", "FAILED", "PENDING"],
    },
    starTime: {
        type: Date,
        default: Date.now(),
        required: true
    },
    endTime: {
        type: Date,
    }
})

export const User = mongoose.model("Users", userSchema);
export const WorkFlow = mongoose.model("WorkFlows", WorkFlowSchema);
export const Node = mongoose.model("nodes", NodesSchema);
export const Execution = mongoose.model("Executions", ExecutionSchema);