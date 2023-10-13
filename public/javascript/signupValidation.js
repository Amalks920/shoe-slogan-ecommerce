const usernameElement=document.getElementById('username')
const userNameError=document.getElementById('usernameErr')
const emailElement=document.getElementById('signupEmail')
const emailErr=document.getElementById('emailErr')
const passwordInput = document.getElementById("signupPassword")
const rePasswordInput = document.getElementById("signupRePassword")
const passwordError = document.getElementById("passwordErr")
const signupForm=document.getElementById('signupForm')



const usernamePattern=/^[a-zA-Z]{3,}$/
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern=/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;




function validateuserName(username) {
    return usernamePattern.test(username)
}


function validateEmail(email) {
    return emailPattern.test(email)
}


  function validatePassword(password) {
    return passwordPattern.test(password)
  }

const handleSignUpSubmit=(event)=>{
    event.preventDefault()
    if(usernameElement.value===""){
    document.getElementById('usernameErr').textContent="Username Should not be blank"
    event.preventDefault()
    }

 
    if(!validateuserName(usernameElement.value)){
  
        document.getElementById('usernameErr').textContent='Username is invalid'
        event.preventDefault()
    }


    if(emailElement.value===""){
        document.getElementById('emailErr').textContent="Email Should not be blank"
       
        }

 
    if(!validateEmail(emailElement.value)){
        document.getElementById('emailErr').textContent='Email is invalid'
        event.preventDefault()
    }

    if (passwordInput.value === "") {
        passwordError.textContent = "Password cannot be blank";
        event.preventDefault();
        return;
      }
      if (rePasswordInput.value === "") {
        passwordError.textContent = "Password cannot be blank";
        event.preventDefault();
        return;
      }


      if(passwordInput.value.trim()!=rePasswordInput.value.trim()){
        console.log('bothlsdkjf')
        passwordError.textContent = "Both Passwords should be equal";
        event.preventDefault();
        return 
      }

      if (validatePassword(passwordInput.value)) {
   
        passwordError.textContent = ""; 
        
        
      } else {
     
        passwordError.textContent = "Invalid password!";
        event.preventDefault();
        return;
     
      }
    

    			// Create a FormData object to collect form data
			const formData = new FormData(signupForm);
			const username = formData.get("username");
       		const email = formData.get("email");
        	const password = formData.getAll("password");
			let data={
				username:username,
				email:email,
				password:password
			}
			fetch("/user-signup", {
				method: "POST",
				headers: {
                "Content-Type": "application/json",
           				 },
				body:JSON.stringify(data),
			})
				.then((response) =>  response.json())
				.then((data) => {
					// Handle the response from the server
					console.log(data)
					if (data.success) {
						
						window.location.href = "/loginOrSignup";
						
					} else {
            console.log(data)
						// Handle error, display error messages, etc.
						document.getElementById("usernameErr").textContent = data.usernameError;
						document.getElementById("emailErr").textContent = data.message;
						document.getElementById("passwordErr").textContent = data.passwordError;
					}
				})
				.catch((error) => {
					console.error("Error:", error);
				});
  
    

}




signupForm.addEventListener('submit',handleSignUpSubmit)




