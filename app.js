if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/serviceWorker.js")
      .then((registration) => {
        console.log("service worker registered");

        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            console.log("Notification Permission Granted");
            const options = {
              body: "This is a reminder message",
              icon: "/assets/icons/icon-48x48.png",
            };
            registration.showNotification("Prayers Time App", options);
          } else {
            console.log("Notification permission:", permission);
          }
        });
      })
      .catch((err) => console.log("service worker not registered", err));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const dateElement = document.querySelector(".date");
  const timeElement = document.querySelector(".time");

  const updateDateTime = () => {
    dateElement.textContent = moment().format("dddd, MMMM Do YYYY");
    timeElement.textContent = moment().format("h:mm:ss A");
  };

  setInterval(updateDateTime, 1000);
  updateDateTime();
});

const form = document.getElementById("registrationForm");
form.addEventListener("submit", (event) => {
  event.preventDefault();
 
  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const emailRegx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (firstName === "") {
    Swal.fire({
      icon: "error",
      title: "First name is required",
      text: "Please enter your first name",
    });
  } else if (lastName === "") {
    Swal.fire({
      icon: "error",
      title: "Last name is required",
      text: "Please enter your last name",
    });
  } else if (email === "" || !emailRegx.test(email)) {
    Swal.fire({
      icon: "error",
      title: "invalid email",
      text: "Please enter a valid email address",
    });
  } else if (password === "") {
    Swal.fire({
      icon: "error",
      title: "Password is required",
      text: "Please enter your password",
    });
  } else {
    Swal.fire({
      icon: "success",
      title: `Registration Successful`,
      text: `${firstName} ${lastName}, you have been successfully registered!`,
      showConfirmButton: false,
      timer: 2000,
    });
    setTimeout(() => {
      window.location.href = "./namaz.html";
    }, 3000);

    
    const userData = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
    };
    const arrData = JSON.parse(localStorage.getItem("userDataArray")) || [];
    arrData.push(userData);
    localStorage.setItem("userDataArray", JSON.stringify(arrData));

    form.reset();

   
  }

  form.classList.add("was-validated");
});


