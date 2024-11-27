if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("/serviceWorker.js")
      .then((registration) => {
        console.log("Service worker registered");

        Notification.requestPermission().then((res) => {
          if (Notification.permission == "granted") {
            console.log("Notification permission granted");
            showNotification(registration);
          } else {
            console.log("Notification permission:", res);
          }
        });
      })
      .catch((err) => console.log("service worker not registered", err));
  });
  function showNotification(registration) {
    const options = {
      body: "This is body message Body",
      icon: "/assets/icons/icon-48x48.png",
    };
    registration.showNotification("Prayers Time App", options);
  }
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

document.getElementById("loginForm").addEventListener("submit", (event) => {
  event.preventDefault();
  login();
});

function login() {
  const emailInput = document.getElementById("email").value.trim();
  const passwordInput = document.getElementById("password").value.trim();
  const storeData = JSON.parse(localStorage.getItem("userDataArray")) || [];
  const loginForm = document.getElementById("loginForm");

  console.log(storeData);

  if (!storeData || storeData.length === 0) {
    Swal.fire({
      icon: "error",
      title: "No Account Found",
      text: "Please sign up before logging in.",
      confirmButtonText: "Sign up",
    }).then(() => {
      window.location.href = "index.html";
    });
    return;
  }

  if (!emailInput || !passwordInput) {
    Swal.fire({
      icon: "warning",
      title: "Input Required",
      text: "Please enter both email and password.",
    });
    return;
  }

  let userFound = storeData.some(user => {
    if (user.email === emailInput && user.password === passwordInput) {
      Swal.fire({
        icon: "success",
        title: `${user.email}\nLogin Successful`,
        text: "Welcome back!",
        showConfirmButton: false,
        timer: 2000,
      });
      setTimeout(() => {
        window.location.href = "namaz.html";
      }, 2000);

      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("currentUser", JSON.stringify(user)); 

      loginForm.reset();
      return true;
    }
    return false;
  });

  if (!userFound) {
    Swal.fire({
      icon: "error",
      title: "Login Failed",
      text: "Incorrect email or password. Please try again.",
      showCancelButton: true,
      confirmButtonText: "Sign up",
      cancelButtonText: "Try Again",
    })

    loginForm.reset();
  }
}
