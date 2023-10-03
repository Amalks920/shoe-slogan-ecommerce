

   

function toast(text){




    Toastify({
  text: `${text}`,
  duration: 3000,
  destination: "https://github.com/apvarun/toastify-js",
  newWindow: true,
  close: true,
  gravity: "top", 
  position: "left",
  stopOnFocus: true,
  style: {
    background: "linear-gradient(to right, #00b09b, #96c93d)",
  },
  onClick: function(){
    console.log('toast clicked')
  } 
}).showToast();


}
