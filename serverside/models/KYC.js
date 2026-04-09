import mongoose from "mongoose";

const kycSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    fullName: { type: String, required: true },
    fatherName: { type: String, required: true },
    motherName: { type: String, required: true },
    grandfatherName: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    phoneNumber: { type: String, required: true },
    occupation: { type: String, required: true },
    country: { type: String, required: true },

    permanentAddress: {
        district: { type: String, required: true },
        municipality: { type: String, required: true },
        ward: { type: String, required: true },
        villageStreet: { type: String, required: true }
    },
    currentAddress: {
        district: { type: String, required: true },
        municipality: { type: String, required: true },
        ward: { type: String, required: true },
        villageStreet: { type: String, required: true }
    },

    idType: {
        type: String,
        enum: ['Citizenship', 'Passport', 'Driving License', 'Voter ID'],
        required: true
    },
    idNumber: { type: String, required: true },
    issueDate: { type: Date, required: true },
    issueDistrict: { type: String, required: true },

    profilePhoto: { type: String, required: true }, // Path to passport photo
    idFront: { type: String, required: true }, // Path to ID Front
    idBack: { type: String, required: true },  // Path to ID Back

    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    rejectionReason: { type: String, default: '' }
}, { timestamps: true });

const kycModel = mongoose.models.kyc || mongoose.model('kyc', kycSchema);

export default kycModel;
