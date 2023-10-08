const addressModal = require("../model/addressModal")

const findAddress=(addressIndex,userId)=>{
    return new Promise(async(resolve,reject)=>{
        try {
            const address=await addressModal.findOne({user:userId})
            selectedAddress=address.address[addressIndex]
            resolve(selectedAddress)
          } catch (error) {
            reject(error)
          }

    })
}

const EditAddress=(address,addressIndex,userId)=>{

    return new Promise(async(resolve,reject)=>{
        try {
        const query={
            user:userId
        }

        const update={
            $set:{
                [`address.${addressIndex}`]:address
            }
        }

       const updated= await addressModal.findOneAndUpdate(query,update,{new:true})
        resolve(updated)
        } catch (error) {
            reject(error)
        }
    })
}




module.exports={
    findAddress,
    EditAddress
}