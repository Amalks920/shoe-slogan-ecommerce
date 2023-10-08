const orderModal = require("../model/orderModal")

const findCategoryWiseOrders=()=>{

    return new Promise(async (resolve,reject)=>{
        try {
            const orders = await orderModal.aggregate([
                {
                    $match:{
                        orderStatus:"Delivered"
                    }
                },
                {
                  $unwind: '$items' // Unwind the items array
                },
                {
                  $lookup: {
                    from: 'products', // Adjust the collection name as needed
                    localField: 'items.productId',
                    foreignField: '_id',
                    as: 'product'
                  }
                },
                {
                  $unwind: '$product' // Unwind the product array
                },
                {
                  $group: {
                    _id: '$product.productCategory', // Group by category
                    totalRevenue: { $sum: {$multiply:['$product.price','$items.quantity']} } // Calculate the sum of totalAmount
                  }
                }
              ]);
              
              
            console.log(orders)
            console.log('sdlkflkjsdlorderssssssss')
            resolve(orders)
            
        } catch (error) {
            reject(error)
        }

    })

   
  
}


module.exports={
    findCategoryWiseOrders
}