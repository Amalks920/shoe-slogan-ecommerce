const productModal = require("../model/productModal")



const findProducts= ()=>{

    return new Promise(async(resolve,reject)=>{
        try {
        const products=await productModal.find({ status: { $ne: "Delisted" } })
        resolve(products)
        return docu
        } catch (error) {
            reject(error)
        }
    })

}


module.exports={
findProducts
}