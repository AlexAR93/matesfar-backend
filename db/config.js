const mongoose=require('mongoose')

const connectToMongo=async ()=>{
    try {
        await mongoose.connect(process.env.DB_CNN);
    } catch (error) {
        console.error('❌ Mongo error:', error);
        process.exit(1);
    }
}

module.exports = connectToMongo;
