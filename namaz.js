if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/serviceWorker.js")
      .then((registration) => {
        console.log("Service worker registered.", registration);

        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            console.log("Notification permission granted.");
          } else {
            console.log("Notification permission denied.");
          }
        });
      })
      .catch((error) =>
        console.log("Service worker registration failed:", error)
      );
  });
}

const schedulePrayerNotification = (prayerName, prayerTime) => {
  const now = new Date();
  const karachiNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi" })
  );

  const prayerDate = new Date(
    `${karachiNow.toISOString().split("T")[0]}T${prayerTime}`
  );

  const timeUntilPrayer = prayerDate - now;

  if (timeUntilPrayer > 0) {
    setTimeout(() => {
      if (Notification.permission === "granted") {
        navigator.serviceWorker.ready.then((registration) => {
          const options = {
            body: `${prayerName} is starting now. Don't forget to pray!`,
            icon: "/assets/icons/icon-48x48.png",
          };
          registration.showNotification(
            `Prayer Reminder: ${prayerName}`,
            options
          );
        });
      } else {
        console.log("Notification permission not granted yet.");
      }
    }, timeUntilPrayer);
  } else {
    console.log("The prayer time has already passed.");
  }
};

schedulePrayerNotification("Fajr", "05:30");

function checkAuthentication() {
  const isAuthenticated = localStorage.getItem("isAuthenticated");
  if (!isAuthenticated) {
    window.location.href = "./login.html";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (typeof checkAuthentication === "function") checkAuthentication();

  const now = new Date();
  const hijriDate = now.toLocaleDateString("en-US-u-ca-islamic", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  document.getElementById("islamic-date").textContent = hijriDate;

  const gregorianDate = now.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  document.getElementById("gregorian-date").textContent = gregorianDate;

  const updateTimeZone = () => {
    const karachiTime = new Date().toLocaleTimeString("en-US", {
      timeZone: "Asia/Karachi",
      hour12: false,
    });
    document.getElementById("GMT-timeZone").textContent = `GMT: ${
      Intl.DateTimeFormat().resolvedOptions().timeZone
    }`;
    document.getElementById("time").textContent = karachiTime;
  };
  setInterval(updateTimeZone, 1000);

  const updatePrayerTimes = (lat, long) => {
    if (typeof getPrayerTimes === "function") {
      getPrayerTimes(lat, long);
    } else {
      console.warn("getPrayerTimes function not found.");
    }
  };

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        document.getElementById("latitude").textContent =
          "Latitude: " + latitude.toFixed(4);
        document.getElementById("longitude").textContent =
          "Longitude: " + longitude.toFixed(4);
        updatePrayerTimes(latitude, longitude);
      },
      (error) => {
        console.warn("Geolocation failed:", error);
        updatePrayerTimes(24.8607, 67.0011);
      }
    );
  } else {
    updatePrayerTimes(24.8607, 67.0011);
  }
});

let prayerTimes = [];

const getPrayerTimes = async (lat, long) => {
  const date = new Date().toISOString().split("T")[0];

  const apiUrl = `https://api.aladhan.com/v1/timings/${date}?latitude=${lat}&longitude=${long}&method=1&school=1`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    console.log(data);
    if (data.code === 200 && data.data && data.data && data.data.timings) {
      updatePrayerTimesUI(data.data.timings);
   
      setInterval(updatePrayerStyle, 60000);
    } else {
      console.error("Error in response from API:", data);
    }
  } catch (error) {
    console.error("Error fetching prayer times:", error);
  }
};

const updatePrayerTimesUI = (timings) => {
  const prayerIds = {
    Fajr: "fajr-time",
    Sunrise: "sunrise-time",
    Dhuhr: "zuhr-time",
    Asr: "asr-time",
    Maghrib: "maghrib-time",
    Isha: "isha-time",
  };

  const currentDate = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Karachi",
  });

  prayerTimes = Object.entries(timings)
    .filter(([prayer]) =>
      ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"].includes(prayer)
    )
    .map(([prayer, time]) => ({
      name: prayer,
      time: new Date(`${currentDate}T${time}`),
    }));

  for (const prayer in prayerIds) {
    const element = document.getElementById(prayerIds[prayer]);
    if (element) {
      const prayerData = prayerTimes.find((p) => p.name === prayer);
      if (prayerData && !isNaN(prayerData.time)) {
        element.innerText = prayerData.time.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          
          hour12: false,
          timeZone: "Asia/Karachi",
        });
      } else {
        console.error(`Invalid date for ${prayer}`);
      }
    } else {
      console.warn(
        `Element with ID '${prayerIds[prayer]}' not found in the DOM.`
      );
    }
  }

  updatePrayerTime();
  setInterval(updatePrayerTime, 1000);
  setTimeout(updatePrayerStyle, 100);
};

const updatePrayerTime = () => {
  const karachiNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi" })
  );

  let currentPrayer = null;
  let nextPrayer = null;

 
  for (let i = 0; i < prayerTimes.length; i++) {
    const prayerTime = new Date(prayerTimes[i].time);

    if (karachiNow < prayerTime) {
      currentPrayer =
        i === 0 ? prayerTimes[prayerTimes.length - 1] : prayerTimes[i - 1];
      nextPrayer = prayerTimes[i];
      break;
    }

    if (i === prayerTimes.length - 1) {
      currentPrayer = prayerTimes[i];
      nextPrayer = prayerTimes[0];
    }
  }

  if (currentPrayer && nextPrayer) {
  
    let nextPrayerTime = new Date(nextPrayer.time);
    if (nextPrayerTime < karachiNow) {
      
      nextPrayerTime.setDate(nextPrayerTime.getDate() + 1);
    }

    
    const timeDifference = nextPrayerTime - karachiNow;
    const hoursRemaining = Math.floor(timeDifference / (1000 * 60 * 60)); 
    const minutesRemaining = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60)); 

   
    document.getElementById(
      "currentPrayerName"
    ).innerText = `${currentPrayer.name}`;
    document.getElementById("currentPrayerTime").innerText =
      currentPrayer.time.toLocaleTimeString("en-GB", { hour12: false });

   
   
    document.getElementById(
      "remainingTime"
    ).innerText = `0${hoursRemaining}:${minutesRemaining}`;
  } else {
    console.error("Failed to determine current or next prayer.");
  }
};

function updatePrayerStyle() {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi" })
  );

  prayerTimes.forEach((prayer, i) => {
    const element = document.getElementById(prayer.name.toLowerCase());
   
    if (!element) return; 

    const nextPrayer = prayerTimes[i + 1] || prayerTimes[0];
 
    const currentPrayerTime = new Date(prayer.time);

    let nextPrayerTime = new Date(nextPrayer.time);
 

   
    if (nextPrayerTime < currentPrayerTime) {
      nextPrayerTime.setDate(nextPrayerTime.getDate() + 1);
    }
    

    const remainingMinutes = Math.floor((nextPrayerTime - now) / (1000 * 60));

    element.classList.remove("active-prayer", "ending-prayer");

    if (now >= currentPrayerTime && now < nextPrayerTime) {
      element.classList.add("active-prayer");
    }

    if (remainingMinutes <= 30 && remainingMinutes > 0) {
      element.classList.add("ending-prayer");
    }
  });
}



const logoutBtn = document.getElementById("Logout");
logoutBtn.addEventListener("click", () => {
  logOut();
  // localStorage.clear();
});
function logOut() {
  Swal.fire({
    title: "Are you sure?",
    text: "You will be logged out!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, log me out!",
    cancelButtonText: "No, keep me logged in",
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("currentUser");
      window.location.href = "./login.html";
      Swal.fire({
        icon: "success",
        title: "Logged out!",
        text: "You have successfully logged out.",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  });
}
