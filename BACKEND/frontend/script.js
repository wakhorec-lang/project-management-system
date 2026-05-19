const API = "/api/auth";

async function signup() {

  const name =
  document.getElementById("name").value;

  const email =
  document.getElementById("email").value;

  const password =
  document.getElementById("password").value;

  const role =
  document.getElementById("role").value;

  const response = await fetch(
    `${API}/signup`,
    {

      method: "POST",

      headers: {
        "Content-Type":
        "application/json"
      },

      body: JSON.stringify({
        name,
        email,
        password,
        role
      })

    }
  );

  const data =
  await response.json();

  if (data.message === "User Registered Successfully") {
    localStorage.setItem("token", data.token);
    localStorage.setItem("userName", data.user.name);
    localStorage.setItem("userEmail", data.user.email);
    localStorage.setItem("userRole", data.user.role);
    if (data.user.role === "admin") {
      window.location.href = "admin-dashboard.html";
    } else {
      window.location.href = "member-dashboard.html";
    }
  } else {
    alert(data.message || "Signup failed");
  }
}

async function login() {

  const email =
  document.getElementById(
    "loginEmail"
  ).value;

  const password =
  document.getElementById(
    "loginPassword"
  ).value;

  const response = await fetch(
    `${API}/login`,
    {

      method: "POST",

      headers: {
        "Content-Type":
        "application/json"
      },

      body: JSON.stringify({
        email,
        password
      })

    }
  );

  const data =
  await response.json();

  if (data.token) {
    localStorage.setItem("token", data.token);
    if (data.user) {
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("userRole", data.user.role);
    }
    if (data.user && data.user.role === "admin") {
      window.location.href = "admin-dashboard.html";
    } else {
      window.location.href = "member-dashboard.html";
    }
  } else {
    document.getElementById("message").innerText = data.message;
  }

}