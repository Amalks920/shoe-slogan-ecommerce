

let base64Array=[]
function cropImg(crpImg,btn){




const cropper=new Cropper(crpImg,{
    aspectRatio:0,
    viewMode:0,
    minContainerWidth:400,
    minContainerHeight:200
})



btn.addEventListener('click',async function(){
    const newImage=cropper.getCroppedCanvas()
  
    crpImg.src=newImage.toDataURL('image/png')
   
    const base64=newImage.toDataURL('image/png')
   
    
  base64Array.push(base64)
  console.log(base64Array)
  localStorage.setItem('base64Images', JSON.stringify(base64Array));



    cropper.destroy()
})

cropper.destroy


}