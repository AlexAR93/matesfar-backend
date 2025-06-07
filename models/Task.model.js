const { default: mongoose } = require("mongoose");
const { Schema, model } = require("mongoose");

const SubtaskSchema = new Schema({
    text: {
      type: String,
      required: true,  // Asegúrate de que cada subtask tenga texto
    },
  });

const TaskSchema=Schema({
    title:{
        type: String,
        required:true,
    },
    taskList:[SubtaskSchema],
    from:{
        type: Schema.Types.ObjectId,
        ref: 'Board',
        required:true,
    }

});

TaskSchema.method('toJSON',function(){
    const{__v,_id, ...object}=this.toObject();
    object.id=_id;
    return object;
})

const Task=model('Task', TaskSchema);

module.exports = Task;