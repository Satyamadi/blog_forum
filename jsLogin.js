document.addEventListener("DOMContentLoaded", function () {
    const signInButton = document.getElementById("signIn");
    const signUpButton = document.getElementById("signUp");
    const formContainer = document.getElementById("formContainer");
    const toggleButton = document.getElementById("formToggleButton");
  
    const signInContainer = document.querySelector(".sign-in-container");
    const signUpContainer = document.querySelector(".sign-up-container");
  
    // Function to check screen size
    function isMobileView() {
      return window.innerWidth <= 768;
    }
  
    // Mobile toggle functionality
    function setupMobileToggle() {
      if (isMobileView()) {
        // Initial state for mobile view
        signInContainer.style.display = "block";
        signUpContainer.style.display = "none";
        toggleButton.textContent = "Sign Up";
  
        // Show toggle button
        toggleButton.parentElement.style.display = "flex";
  
        // Toggle between forms
        toggleButton.addEventListener("click", function () {
          if (signInContainer.style.display === "block") {
            signInContainer.style.display = "none";
            signUpContainer.style.display = "block";
            toggleButton.textContent = "Sign In";
          } else {
            signInContainer.style.display = "block";
            signUpContainer.style.display = "none";
            toggleButton.textContent = "Sign Up";
          }
        });
      } else {
        // Restore desktop layout
        signInContainer.style.display = "";
        signUpContainer.style.display = "";
        toggleButton.parentElement.style.display = "none";
      }
    }
  
    // Desktop functionality for sign-in and sign-up buttons
    signInButton.addEventListener("click", () => {
      if (!isMobileView()) {
        formContainer.classList.remove("right-panel-active");
      }
    });
  
    signUpButton.addEventListener("click", () => {
      if (!isMobileView()) {
        formContainer.classList.add("right-panel-active");
      }
    });
  
    // Set up toggle behavior on load and resize
    setupMobileToggle();
    window.addEventListener("resize", setupMobileToggle);
  });
  