const toDate=document.querySelector('#to');
const fromDate=document.querySelector('#from');
const form=document.querySelector('#form')
const dateFilterBtn=document.querySelector('#date-filter')


let to,from;

toDate.addEventListener('input',function () {
 to=toDate.value

    

  
})

fromDate.addEventListener('input',function () {
from=fromDate.value
console.log(from)
})


form.addEventListener('submit', function (event) {



    if(to && from){

        let filterParameters={
            to:to,
            from:from
        }


  const filterParametersJSON = JSON.stringify(filterParameters);


  const encodedFilterParameters = encodeURIComponent(filterParametersJSON);


  const currentUrl = window.location.href;


  const urlWithParameter = `${currentUrl}?filter=${encodedFilterParameters}`;


  window.location.href = urlWithParameter;

    }else{
     event.preventDefault()
    }


})





