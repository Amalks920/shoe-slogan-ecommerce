// Get all radio buttons by name
const radioButtons = document.getElementsByName("address");
const deleteButtons = document.querySelectorAll("#delete-address");
const addressButton = document.getElementById("selectedAddressButton");
const modalBg = document.querySelector("#modalbg");
const deleteModal = document.querySelector("#delete-modal");
const deleteModalBtn = document.querySelector("#deletebtn");
const cancelModalBtn = document.querySelector("#cancelbtn");
const inputs = document.querySelectorAll(".input");
const addressForm = document.querySelector("#address-form");
const cityErr = document.querySelector("#cityerr");
const addressErr = document.querySelector("#addresserr");
const stateErr = document.querySelector("#staterr");
const mobileErr = document.querySelector("#mobileErr");
const pincodeErr=document.querySelector('#pincodeErr');

addressForm.addEventListener("submit", function (event) {
  let isValid = true;
  inputs.forEach((input, index) => {
    if (input.name === "city") {
      removeErr(input, cityErr);

      isValid = validateAddress(input.value);
      console.log(input.value);
      console.log(isValid);
      if (!isValid) {
        cityErr.style.display = "block";
        event.preventDefault();
      }
    } else if (input.name === "address") {
      removeErr(input, addressErr);
      isValid = validateAddress(input.value);
      if (!isValid) {
        addressErr.style.display = "block";
        event.preventDefault();
      }
    } else if (input.name === "state") {
      removeErr(input, stateErr);
      isValid = validateAddress(input.value);
      if (!isValid) {
        stateErr.style.display = "block";
        event.preventDefault();
      }
    } else if (input.name === "mobileNumber") {
      removeErr(input, mobileErr);
      console.log(input.value)
      isValid = validateMobile(input.value);
      if (!isValid) {
        mobileErr.style.display = "block";
        event.preventDefault();
      }
    } else if(input.name==="pincode") {
      removeErr(input,pincodeErr);
      isValid=validatePinCode(input.value);
      if(!isValid) {
        pincodeErr.style.display="block";
        event.preventDefault();
      }
    }

    if (input.value.trim() === "") {
      isValid = false;
    }
  });

  if (!isValid) {
    event.preventDefault();
  }
});

let addressIndex;
let index;
// Add an event listener to each radio button
radioButtons.forEach((radioButton, index) => {
  console.log("radioButton");
  console.log(radioButton);
  radioButton.addEventListener("change", function () {
    if (this.checked) {
      addressIndex = index - 1;
      console.log(addressIndex);
    }
  });
});

addressButton.addEventListener("click", function () {
  fetch("/select-address", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ index: addressIndex }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data) location.reload(true);
    })
    .catch((error) => {
      // Handle any error that occurred during the request
      console.error(error);
    });
});

deleteButtons.forEach((deleteButton) => {
  deleteButton.addEventListener("click", function () {
    index = deleteButton.attributes[1].value;
    modalBg.style.display = "block";
    deleteModal.style.display = "block";
  });

});

cancelModalBtn.addEventListener("click", function () {
  modalBg.style.display = "none";
  deleteModal.style.display = "none";
});

deleteModalBtn.addEventListener("click", function () {
  handleDelete(index);
});

function handleDelete(index) {
  fetch("/delete-address", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ index: index }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data) location.reload(true);
    })
    .catch((error) => {
      // Handle any error that occurred during the request
      console.error(error);
    });
}

// REGEXP VALIDATIONS

function validateAddress(value) {
  const regexpPattern = /^[A-Za-z' -]{3,50}$/;

  return regexpPattern.test(value.trim());
}

function validateMobile(value) {
  const regexpPattern = /^[789]\d{9}$/;
  return regexpPattern.test(value);
}

function validatePinCode(value) {
  const indianPincodePattern = /^\d{6}$/;
  return indianPincodePattern.test(value);
}

function removeErr(input, err) {
  input.addEventListener("input", function () {
    err.style.display = "none";
  });
}


